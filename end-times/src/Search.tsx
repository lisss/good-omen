import React, { useState } from 'react';
import { search } from './google-search';
import { NewsResult } from './resl';

interface ArticleValidation {
    articleUrl: string;
    title: string;
    isValid: boolean;
}

const data: NewsResult[] = [
    {
        position: 1,
        title: 'Купують і залякують: Зеленський пояснив призначення ...',
        link:
            'https://ua.korrespondent.net/ukraine/4236648-kupuuit-i-zaliakuuit-zelenskyi-poiasnyv-pryznachennia-hubernatora-zakarpattia',
        domain: 'ua.korrespondent.net',
        source: 'Корреспондент.net',
        date: '6 хв. тому',
        snippet:
            'Президент Володимир Зеленський пояснив призначення на пост глави ... За словами Зеленського, Петров був призначений на указану посаду через те, ...',
        thumbnail:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8x90m1434vu9hk03keqkefdt5Vsodr4wLC9BgWyba_VB9DISOJAOxsqIF1H1Oz407NxwGpnnB&s',
    },
    {
        position: 2,
        title: 'Зеленський розповів про ринок землі "для всіх"',
        link:
            'https://ua.korrespondent.net/ukraine/politics/4236645-zelenskyi-rozpoviv-pro-rynok-zemli-dlia-vsikh',
        domain: 'ua.korrespondent.net',
        source: 'Корреспондент.net',
        date: '8 хв. тому',
        snippet:
            'Президент Володимир Зеленський під час візиту в Хмельницьку область в середу, 3 червня, виступив за збереження довгострокової оренди землі ...',
        thumbnail:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbmagl-O5XjHe4iXRJBrnMsJYW8YZJ6cERa0nISQACpiZIm6ZxGv_mQRuNbYrDKGTvMynQV7vD&s',
    },
];

const processArticle = (
    data: NewsResult[],
    textClass: string,
    onComplete: (timeline: NewsResult[]) => void,
    onError: () => void
) => {
    const inputData = data.map((d) => ({
        textClass,
        url: d.link,
    }));
    fetch('https://localhost:4443/', {
        method: 'POST',
        body: JSON.stringify({
            articleInputData: inputData,
        }),
    })
        .then((res) => res.json() as Promise<ArticleValidation[]>)
        .then((r) => {
            const timelineData = data
                .map((x) => {
                    const art = r.find((y) => y.articleUrl === x.link && y.isValid);
                    if (art) {
                        return {
                            ...x,
                            title: art.title,
                        };
                    }
                })
                .filter((x) => x) as NewsResult[];
            onComplete(timelineData);
        })
        .catch(onError);
};

export const Search = ({
    onSearchComplete,
    onSearchError,
}: {
    onSearchComplete: (data: NewsResult[]) => void;
    onSearchError: () => void;
}) => {
    const [searhTerm, setSearchTerm] = useState('');
    const artUrl =
        'https://ua.korrespondent.net/ukraine/4236648-kupuuit-i-zaliakuuit-zelenskyi-poiasnyv-pryznachennia-hubernatora-zakarpattia';

    const onSearch = () => {
        processArticle(data, 'post-item__text', onSearchComplete, onSearchError);
    };

    return (
        <>
            <input onChange={(e) => setSearchTerm(e.currentTarget.value)} />
            {/* <button onClick={() => search(searhTerm)}>Search</button> */}
            <button onClick={onSearch}>Search</button>
        </>
    );
};
