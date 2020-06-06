import os
import json
from tokenize_uk import tokenize_uk


def convert_semantrum_data(semantrum_data_dir, target_data_dir):
    if not os.path.exists(target_data_dir):
        os.makedirs(target_data_dir)
    files = os.listdir(semantrum_data_dir)
    for file in files:
        with open(os.path.join(semantrum_data_dir, file)) as f:
            cont = json.load(f)
            res = []
            hits = cont.get('hits')
            if hits:
                if hits['total']:
                    for hit in cont['hits']['hits']:
                        hit_processed = {}
                        src = hit['_source']
                        hit_processed['tags'] = src.get('geo') or []
                        hit_processed['title'] = src['title']
                        hit_processed['url'] = src['url']
                        hit_processed['content'] = src['text']
                        hit_processed['date'] = src['created']
                        hit_processed['source'] = src['s']['name']
                        res.append(hit_processed)
    with open(os.path.join(target_data_dir, 'semantrum_data.json'), 'w') as f:
        json.dump(res, f, ensure_ascii=False)


def unify_source_data(source_path, source_name, target_path):
    res = []
    with open(source_path) as f:
        cont = json.load(f)
        for article in cont:
            unified = {}
            unified['url'] = article['url']
            unified['date'] = article['date']
            unified['title'] = article['title']
            unified['content'] = article['content']
            unified['tags'] = article.get('tags') or []
            unified['source'] = source_name
            unified['relevant'] = None

            res.append(unified)

    with open(target_path, 'w') as f:
        json.dump(res, f, ensure_ascii=False)


# TODO: correct paths
semantrum_data_dir = '../../../../corpora/semantrum_data'
target_data_dir = '../../data/semantrum_data'

convert_semantrum_data(semantrum_data_dir, target_data_dir)

articles_path = '../../data/articles'

unify_source_data(os.path.join(articles_path, 'korrespondent.json'),
                  'Корреспондент.net',
                  os.path.join(articles_path, 'korrespondent_unif.json')
                  )
unify_source_data(os.path.join(articles_path, 'liga.json'),
                  'liga.net',
                  os.path.join(articles_path, 'liga_unif.json')
                  )
unify_source_data(os.path.join(articles_path, 'pravda.com.ua.json'),
                  'Українська правда',
                  os.path.join(articles_path, 'pravda.com.ua_unif.json')
                  )


source_articles_path = '../../data/articles/source'

all_data_files = os.listdir(source_articles_path)
all_data = []
for file in all_data_files:
    with open(os.path.join(source_articles_path, file)) as f:
        cont = json.load(f)
        for article in cont:
            article['event_date'] = None
            all_data.append(article)
        with open(os.path.join(source_articles_path, file), 'w') as f:
            json.dump(cont, f, ensure_ascii=False)


def normalize_data(source_path, target_path):
    def _is_text_empty_or_numeric(text):
        stripped = text.strip()
        if not stripped:
            return True
        return (stripped.replace(',', '').replace('.', '')
                .replace(':', '').replace(' ', '').isnumeric())

    stop_words = ['нагадаємо,', 'раніше повідомлялося,', 'підписуйтесь',
                  'детальніше читайте:', 'новини партнерів', 'дивіться також:',
                  'читайте також:', 'читайте нас в telegram:', 'читайте нас у telegram:',
                  'радимо підписатися,', 'уп.', 'джерело: ', 'твитнуть', 'про це повідомляє',
                  'як писав ', 'про це заявив ', 'про це стало відомо з'
                  ]
    promo = ['друзі, ми', 'якщо ви читаєте новини безкоштовно, значить хтось заплатив за те, щоб ви їх читали',
             'враховуємо тільки один інтерес - ваш, читацький', 'напишіть нам', 'на правах спонсорства',
             'реклама', 'підпишись на ', 'телевізійна служба новин (тсн)']
    photo_links = [' \nІлюстративне фото: ', ' \nФото: ', ' (Фото: ', ' (фото - ', 'скріншот відео - ',
                   'Фото нижче:', ' (ілюстрація - ', ' (скріншот з відео ', ' (фото: ', 'Фото:',
                   'Ілюстративне фото (', 'Скріншот відео']
    date_words = ['вчора', 'сьогодні', 'позавчора']

    data_normalized = []
    with open(source_path) as f:
        target_articles = []
        articles = json.load(f)
        for i, article in enumerate(articles):
            stop_words.append(article['source'].lower())
            sents_normalized = []
            content = article['content']
            sents = tokenize_uk.tokenize_sents(content)
            for sent in sents:
                sent = sent.replace('×', '').strip()
                sent = sent.replace('\n0 \n0', '').replace('\n1 \n0', '')
                for photo_link in photo_links:
                    if photo_link in sent:
                        splt = sent.split(photo_link)
                        fst_splt = splt[0]
                        if fst_splt:
                            fst = splt[0] + '.'
                        else:
                            fs = fst_splt.split('\n')
                            fst = fs[len(fs) - 1]
                        snd_splt = splt[1].split('\n')
                        if len(snd_splt) > 1:
                            #                                 snd = snd_splt[len(snd_splt) - 1]
                            snd = ' '.join(
                                [x for x in snd_splt if len(x.split(' ')) > 2])
                        else:
                            snd = ''
                        sent = ' '.join([fst, snd]).replace(
                            ' (.', '.').replace('. ', '')
                if sent.isnumeric() \
                        or len(sent.split(' ')) < 3 \
                        or sent.endswith(':'):
                    break
                if any(sp in sent.lower() for sp in promo):
                    break
                if not (any(sw in sent.lower() for sw in stop_words)
                        and not any(dw in sent.lower() for dw in date_words)):
                    sent = '\n'.join(
                        [x for x in sent.split('\n') if len(x.split(' ')) > 2])
                    sents_normalized.append(sent)
            content_normalized = ' '.join(sents_normalized)
            if not _is_text_empty_or_numeric(content_normalized):
                article['content'] = content_normalized
                target_articles.append(article)
    with open(target_path, 'w') as f:
        json.dump(target_articles, f, ensure_ascii=False)


normalize_data(os.path.join(source_articles_path, 'semantrum.json'),
               os.path.join(source_articles_path, 'semantrum_normalized.json'))

normalize_data(os.path.join(source_articles_path, 'korrespondent.json'),
               os.path.join(source_articles_path, 'korrespondent_normalized.json'))


normalize_data(os.path.join(source_articles_path, 'pravda.com.ua.json'),
               os.path.join(source_articles_path, 'pravda.com.ua_normalized.json'))

normalize_data(os.path.join(source_articles_path, 'liga.json'),
               os.path.join(source_articles_path, 'liga_normalized.json'))
