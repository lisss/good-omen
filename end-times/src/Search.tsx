import React, { useState, useEffect } from 'react';
import { convertDate } from './utils';
import { NewsResult } from './types';

const searchArticles = (
    term: string,
    onSearchStart: () => void,
    onComplete: (timeline: NewsResult[]) => void,
    onError: () => void
) => {
    const inputData = {
        term,
    };
    onSearchStart();
    fetch('https://localhost:4443/', {
        method: 'POST',
        body: JSON.stringify({
            inputData: inputData,
        }),
    })
        .then((res) => {
            if (res.status !== 200) {
                onError();
            }
            return res;
        })
        .then((res) => res.json() as Promise<NewsResult[]>)
        .then((res) => {
            const timelineData = res.map((x) => {
                return {
                    ...x,
                    date: convertDate(x.date),
                };
            });

            onComplete(timelineData);
        })
        .catch(onError);
};

export const Search = ({
    onSearchStart,
    onSearchComplete,
    onSearchError,
}: {
    onSearchStart: () => void;
    onSearchComplete: (data: NewsResult[]) => void;
    onSearchError: () => void;
}) => {
    const [searhTerm, setSearchTerm] = useState('');

    const onSearch = (term: string) => {
        searchArticles(term, onSearchStart, onSearchComplete, onSearchError);
    };

    return (
        <div className="search-block">
            <input
                className="search-input"
                placeholder="Введіть, шо вам там треба..."
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
            />
            <button
                className="search-btn"
                onClick={() => onSearch(searhTerm)}
                disabled={!searhTerm}
            >
                Вйо до новин!
            </button>
        </div>
    );
};
