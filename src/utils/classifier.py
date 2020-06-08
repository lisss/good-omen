import stanza

nlp = stanza.Pipeline('uk', processors='tokenize,pos,lemma,depparse')


def parse_features(feats_string):
    res = {}
    feats = feats_string.split('|')
    for feat in feats:
        k, v = feat.split('=')
        res[k] = v
    return res


def get_subj_pred_obj_from_text(text):
    res = []
    try:
        doc = nlp(text)
        for sent in doc.sentences:
            spo = {}
            pred = None
            subj = None
            obj = None
            root = next((word
                         for word in sent.words if word.deprel == 'root' and word.upos == 'VERB'),
                        None)
            if root:
                root_conj = next((word for word in sent.words if word.deprel ==
                                  'conj' and word.head == int(root.id)), None)

                subj = next((word for word in sent.words if word.deprel ==
                             'nsubj' and word.head == int(root.id)), None)
                obj = next(((word.id, word.lemma) for word in sent.words if word.deprel ==
                            'obj' and word.head == int(root_conj.id if root_conj else root.id)),
                           None)

                spo['subj'] = subj.lemma if subj else None
                spo['root'] = root
                spo['root-conj'] = root_conj
                spo['obj'] = obj[1] if obj else None
                if subj:
                    conj = next((word.lemma for word in sent.words if word.deprel ==
                                 'conj' and word.head == int(subj.id)), None)
                    spo['subj-conj'] = conj

            res.append((sent.text, spo))
    except Exception as e:
        print(
            f'Failed to create nlp from text that starts with: {text[:50]} {e}')
    return res


def get_spo(text):
    spos = get_subj_pred_obj_from_text(text)
    # TODO: handle multiple sentences; perhaps take the one containing most from SPO
    raw_text, spo = spos[0] if spos else (text, {})
    return raw_text, spo


def get_data(titles):
    features, labels = [], []

    for i, (title, is_event) in enumerate(titles):
        feat = {}
        title, spo = get_spo(title)
        if spo:
            root = spo['root']
            root_conj = spo.get('root-conj')

            pred_features = parse_features(root.feats)

            subj_conj = spo.get('subj-conj')

            if subj_conj:
                feat['subj'] = f'{spo["subj"]}_{subj_conj}'
            else:
                feat['subj'] = spo.get('subj') or 'NONE'
#             feat['subj'] = spo.get('subj') or 'NONE'

            if root_conj:
                feat['pred'] = f'{root.lemma}_{root_conj.lemma}'
                pred_conj_features = parse_features(root_conj.feats)
                feat['pred-conj-tense'] = pred_conj_features.get(
                    'Tense') or 'NONE'
            else:
                feat['pred'] = root.lemma
#             feat['pred'] = root.lemma
            feat['obj'] = spo.get('obj') or 'NONE'
            feat['pred-tense'] = pred_features.get('Tense') or 'NONE'
        features.append(feat)
        labels.append(is_event)

        if i % 500 == 0:
            print('-->', i)

    return features, labels
