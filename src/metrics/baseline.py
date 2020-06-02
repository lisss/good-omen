import json
import sys
import pandas as pd
import stanza
import os

nlp = stanza.Pipeline('uk', processors='tokenize,pos,lemma,depparse')

absDir = os.path.dirname(os.path.abspath(__file__))
train_data_file_name = '../../data/articles/train/train_spo_it_1.json'
train_data_file = os.path.join(absDir, train_data_file_name)
test_corona_file_name = '../../data/articles/test/corona.json'
test_corona_file = os.path.join(absDir, test_corona_file_name)
test_zelen_file_name = '../../data/articles/test/zelen.json'
test_zelen_file = os.path.join(absDir, test_zelen_file_name)


def get_data_to_annotate(src_dir, src_file_name, map_file_name):
    src_file_path = os.path.join(src_dir, src_file_name)
    with open(src_file_path) as f:
        arts = json.load(f)
        maps = []
        for i, art in enumerate(arts):
            content_to_ann = art['title'] + '\n' + art['content']
            ann_dir_path = src_dir + '_ann'
            if not os.path.isdir(ann_dir_path):
                os.mkdir(ann_dir_path)
            filename = os.path.splitext(src_file_name)[0]
            with open(os.path.join(ann_dir_path, filename + f'_{i}_.txt'), 'w',
                      encoding='utf-8') as fa:
                fa.write(content_to_ann)
            maps.append({i: art['url']})
        with open(os.path.join(ann_dir_path, map_file_name), 'w', encoding='utf-8') as fm:
            json.dump(maps, fm)


def get_subj_pred_obj_text_1(text):
    res = []
    try:
        doc = nlp(text)
        for sent in doc.sentences:
            pred = None
            subj = None
            obj = None
            pred = next(((word.id, word.lemma)
                         for word in sent.words if word.deprel == 'root' and word.upos == 'VERB'),
                        None)
            if pred:

                subj = next(((word.id, word.lemma) for word in sent.words if word.deprel ==
                             'nsubj' and word.head == int(pred[0])), None)
                obj = next(((word.id, word.lemma) for word in sent.words if word.deprel ==
                            'obj' and word.head == int(pred[0])), None)
            if pred:
                res.append(
                    {sent.text: (subj[1] if subj else None, pred[1], obj[1] if obj else None)})
            else:
                res.append({sent.text: None})
    except:
        print('Failed to create nlp from text that starts with: ' + text[:50])
    return res


def get_subj_pred_obj_1(corpus, res_file):
    current_content = []
    with open(res_file, 'w', encoding='utf-8') as f:
        json.dump(current_content, f)

    for i, art in enumerate(corpus):
        title_with_spo = get_subj_pred_obj_text_1(art['title'])
        content_with_spo = get_subj_pred_obj_text_1(art['content'])
        res = {
            'url': art['url'],
            'date': art['date'],
            'title': title_with_spo,
            'content': content_with_spo
        }
        with open(res_file, 'r', encoding='utf-8') as f:
            current_content = json.load(f)
        current_content.append(res)

        with open(res_file, 'w', encoding='utf-8') as f:
            json.dump(current_content, f, ensure_ascii=False)
        print('>>>', i)
    return current_content


def get_test_arts_for_mark(arts):
    for art in arts:
        art.update({'relevant': None})
    return arts


def get_spo(search_obj):
    raw_text, spo = [(k, search_obj[k]) for k in search_obj][0]
    subj, pred, obj = [x.lower() if x else x for x in (
        spo if spo else [None, None, None])]
    return raw_text, subj, pred, obj


def get_is_match(token, spo):
    return token.lemma in spo


def search_by_token(token, article):
    _, t_subj, _, t_obj = get_spo(article['title'][0])
    is_found = get_is_match(token, [t_subj, t_obj])
    if not is_found:
        for sent in article['content']:
            _, s_subj, _, s_obj = get_spo(sent)

            is_found = get_is_match(token, [s_subj, s_obj])
            if is_found:
                break
    return is_found


def search_relevant_articles(search_term, corpus):
    res = []
    search_tokens = nlp(search_term).sentences[0].words

    for article in corpus:
        is_found = None
        title_obj = article['title'][0]
        title, t_subj, _, t_obj = get_spo(article['title'][0])

        if len(search_tokens) == 1:
            is_found = search_by_token(search_tokens[0], article)
        else:
            for token in search_tokens:
                is_found = search_by_token(token, article)
        if is_found:
            res.append(
                {'url': article['url'], 'date': article['date'], 'title': title})
    return res


def validate_result(result, test_data):
    test_true = [x['url'] for x in test_data if x['relevant']]
    actual_urls = [x['url'] for x in result]

    true_positives = len([x for x in actual_urls if x in test_true])
    false_positives = len([x for x in actual_urls if x not in test_true])
    false_negatives = len([x for x in test_true if x not in actual_urls])

    act_len = len(actual_urls)

    recall = round(true_positives/(true_positives + false_negatives), 2)
    precision = round(true_positives/(true_positives + false_positives), 2)

    return ({'recall': recall, 'precision': precision})


""" TEST """
search_corona = 'коронавірус'
search_zelen = 'зеленський'

with open(train_data_file) as f:
    corpus = json.load(f)

corona_results = search_relevant_articles(search_corona, corpus)
zelen_results = search_relevant_articles(search_zelen, corpus)


with open(test_corona_file) as f:
    test_corona_data = json.load(f)
res = validate_result(corona_results, test_corona_data)
print(res)

with open(test_zelen_file) as f:
    test_zelen_data = json.load(f)
res = validate_result(zelen_results, test_zelen_data)
print(res)
