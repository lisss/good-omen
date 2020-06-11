from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl
from io import BytesIO
import json
import requests
import datetime
import re
import os
from bs4 import BeautifulSoup
from serpwow.google_search_results import GoogleSearchResults
import stanza
from joblib import load


absDir = os.path.dirname(os.path.abspath(__file__))
clf_file_name = './classifier.joblib'
demo_data_file_name = './demo_data.json'
key_file_name = './key.pem'
cert_file_name = './cert.pem'
clf_file = os.path.join(absDir, clf_file_name)
demo_data_file = os.path.join(absDir, demo_data_file_name)
key_file = os.path.join(absDir, key_file_name)
cert_file = os.path.join(absDir, cert_file_name)

serpwow = GoogleSearchResults("FA2C2241D0A346A28A4A3A6E180C09A4")
nlp = stanza.Pipeline('uk', processors='tokenize,pos,lemma,depparse')
clf = load(clf_file)


''' NLP '''


def parse_features(feats_string):
    res = {}
    feats = feats_string.split('|')
    for feat in feats:
        k, v = feat.split('=')
        res[k] = v
    return res


def find_dates(string, is_future=False):
    valid_months = ['січня', 'січ.', 'лютого', 'лют.', 'березня', 'берез.', 'квітня', 'квіт.',
                    'травня', 'трав.', 'червня', 'черв.', 'липня', 'лип.', 'серпня', 'серп.',
                    'вересня', 'верес.', 'жовтня', 'жовт.', 'листопада', 'листоп.',
                    'грудня', 'груд.']

    mon_regex_str = '|'.join(valid_months).replace('.', '\\.')
    regex = '(\\s\\d{4}\\s|(\\d+ (' + mon_regex_str + \
        ')(\\s\\d{4})?)|\\d{2,4}-\\d{2}-\\d{2,4}|\\d{2}.\\d{2}.\\d{2,4}|\\d{2}\\/\\d{2}\\/\\d{2,4})'
    matches = re.findall(regex, string, re.IGNORECASE)
    dates = []
    for match in matches:
        date = match[0].strip()
        if len(date) == 4:
            curr_year = datetime.datetime.now().year
            # fragile thing, it may predict date if it's actually some other 4-digit stuff
            if int(date) <= curr_year or is_future:
                dates.append(date)
        else:
            dates.append(date)
    return dates


def get_doc_core_members(doc):
    res = []

    adv_final = ['вперше', 'нарешті', 'врешті',
                 'вчора', 'сьогодні', 'позавчора']

    for sent in doc.sentences:
        spo = {}
        pred = None
        subj = None
        obj = None

        num_words = len(sent.words)

        root = next((word
                     for word in sent.words if word.deprel == 'root'),
                    None)
        if not doc.text.strip() or num_words == 2 and sent.words[num_words - 1].upos == 'PUNCT':
            continue

        # FIXME: iterate only once
        if root:
            root_conj = next((word for word in sent.words if word.deprel ==
                              'conj' and word.head == int(root.id)), None)
            root_mod = next((word for word in sent.words if word.deprel ==
                             'advmod' and word.upos == 'PART' and word.head == int(root.id)), None)

            subj = next((word for word in sent.words if word.deprel ==
                         'nsubj' and word.head == int(root.id)), None)
            obj = next((word for word in sent.words if word.deprel ==
                        'obj' and word.head == int(root_conj.id if root_conj else root.id)),
                       None)
            c_conj = next((word
                           for word in sent.words if word.upos == 'CCONJ'
                           and sent.words[int(word.id) - 2].upos == 'PUNCT'),
                          None)
            root_adv_final = next((word for word in sent.words if word.deprel ==
                                   'advmod' and word.upos == 'ADV' and word.head == int(
                                       root.id)
                                   and word.lemma in adv_final),
                                  None)
            root_xcomp = next((word for word in sent.words if word.deprel ==
                               'xcomp' and word.head == int(root.id)), None)
            root_xcomp_noun = next((word for word in sent.words if word.deprel == 'xcomp:sp'
                                    and word.upos == 'NOUN'
                                    and word.head == int(root.id)),
                                   None)

            spo['subj'] = subj
            spo['root'] = root
            spo['root-conj'] = root_conj
            spo['obj'] = obj
            spo['root_mod'] = root_mod
            spo['c_conj'] = c_conj
            spo['root_adv_final'] = root_adv_final
            spo['root_xcomp'] = root_xcomp
            spo['root_xcomp_noun'] = root_xcomp_noun
            if subj:
                subj_conj = next((word for word in sent.words if word.deprel ==
                                  'conj' and (
                                      word.upos == 'NOUN' or word.upos == 'PRON')
                                  and word.head == int(subj.id)), None)
                spo['subj-conj'] = subj_conj
                if subj_conj:
                    subj_conj_verb = next((word for word in sent.words if word.upos ==
                                           'VERB' and word.head == int(subj_conj.id)),
                                          None)
                    spo['subj-conj-verb'] = subj_conj_verb

        res.append((sent.text, spo))
    return res


def get_features(doc):
    features = []

    predicate_special = ['допустити', 'думати', 'припустити', 'відреагувати', 'пояснити',
                         'сказати', 'заявити', 'повідомити', 'повідомляти', 'розповісти',
                         'розповідати', 'рекомендувати', 'порекомендувати', 'мати',
                         'стати', 'почати']

    spos = get_doc_core_members(doc)
    for sent_text, spo in spos:
        feat = {}
        if spo:
            root = spo['root']
            root_conj = spo.get('root-conj')
            root_adv_final = spo.get('root_adv_final')
            root_xcomp = spo.get('root_xcomp')
            root_xcomp_noun = spo.get('root_xcomp_noun')
            subj = spo.get('subj')
            subj_conj = spo.get('subj-conj')
            obj = spo.get('obj')

            dates = find_dates(doc.text, True)

            if root.feats:
                pred_features = parse_features(root.feats)
            else:
                pred_features = {}

            feat['subj'] = 'SUBJ' if subj else 'NONE'
            feat['has-date'] = len(dates) > 0
            if pred_features.get('Tense') == 'Past':
                feat['root_xcomp'] = root_xcomp is not None
                if root_xcomp:
                    feat['root_xcomp_pos'] = root_xcomp.upos

            if subj:
                feat['subj-pos'] = subj.upos

            feat['pred'] = root.lemma
            feat['pred-pos'] = root.upos
            feat['obj'] = 'OBJ' if obj else 'NONE'
            if obj:
                feat['obj-pos'] = obj.upos
            if root.upos == 'VERB':
                feat['pred-tense'] = pred_features.get('Tense') or 'NONE'
                feat['pred-aspect'] = pred_features.get('Aspect') or 'NONE'
            if root.upos == 'NOUN' or root.upos == 'PROPN':
                feat['pred-anim'] = pred_features.get('Animacy') or 'NONE'
                feat['pred-abbr'] = pred_features.get('Abbr') or 'NONE'

            features.append(feat)
    return features


''' END NLP'''


def is_term_in_title(title_doc, term_doc):
    for sent in title_doc.sentences:
        for word in sent.words:
            for term_word in term_doc.sentences[0].words:
                is_in = term_word.lemma.lower() == word.lemma.lower()
                if is_in:
                    return True
    return False


def predict_is_event(title, snippet, term, clf):
    title_doc = nlp(title)
    if snippet:
        snippet_doc = nlp(snippet)
    term_doc = nlp(term)

    is_term_in = is_term_in_title(title_doc, term_doc)
    if snippet:
        is_term_in = is_term_in or is_term_in_title(snippet_doc, term_doc)
    if not is_term_in:
        return False
    title_features = get_features(title_doc)
    is_title_ev = clf.predict(title_features)[0]
    if snippet:
        snippet_features = get_features(snippet_doc)
        is_snippet_ev = clf.predict(snippet_features)[0]

    is_ev = is_title_ev

    if snippet:
        is_ev = is_title_ev or is_snippet_ev

    return is_ev


def get_demo_data():
    with open(demo_data_file) as f:
        demo_data = json.load(f)
        return demo_data


# TODO: pass time_period and num from FE
def get_search_results(term):
    results = []
    is_end = False
    for i in range(1, 17, 2):
        if is_end:
            return results
        print(f'Querying page {i} ...')
        params = {
            "q": term,
            "search_type": "news",
            # "show_duplicates": "false",
            "time_period": "last_year",
            "sort_by": "relevance",
            "hl": "uk",
            "gl": "ua",
            "num": "20",
            "page": str(i),
        }

        result = serpwow.get_json(params)
        if result.get('news_results'):
            for news in result['news_results']:
                results.append(news)
            print(f'Queried page {i}')
        else:
            print(f'Looks like no results at page {i}')
            is_end = True

    return results


cache = {}


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        response = BytesIO()
        try:
            resp_data = []
            body_params = json.loads(body)
            input_data = body_params.get('inputData')
            search_term = input_data.get('term')
            if search_term:
                search_term = search_term.strip()
                search_results = get_search_results(search_term)
                # search_data = get_demo_data()

                num_res = len(search_results)
                for i, article in enumerate(search_results):
                    title = None
                    article_title = article['title']
                    article_snippet = article.get('snippet')
                    if article_title.endswith(' ...'):
                        link = article['link']
                        if cache.get(link):
                            title = cache[link]
                        else:
                            try:
                                r = requests.get(link, timeout=(1, 2))
                                if r.encoding != 'CP1251' and r.encoding != 'windows-1251':
                                    r.encoding = 'utf-8'
                                html = r.text
                                soup = BeautifulSoup(html)
                                h1 = soup.find('h1')
                                if h1:
                                    title = h1.string
                                else:
                                    title = soup.title.string
                                if title:
                                    cache[link] = title
                            except Exception as e:
                                print(e)
                                print(link)
                    else:
                        title = article_title
                    if title:
                        is_event = predict_is_event(
                            title.strip(), article_snippet, search_term, clf)
                        if is_event:
                            resp_data.append(article)
                    print(f'Processed {i} from {num_res}')

            response.write(json.dumps(
                resp_data, ensure_ascii=False).encode('utf-8'))

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(response.getvalue())
        except Exception as e:
            print(e)
            response.write(str(e).encode('utf-8'))
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.getvalue())


httpd = HTTPServer(('localhost', 4443), SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile=key_file,
                               certfile=cert_file, server_side=True)

httpd.serve_forever()
