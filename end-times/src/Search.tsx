import React, { useState, SyntheticEvent } from 'react';
import { convertDate } from './utils';
import { NewsResult } from './types';

type SearchPeriod = 'last_year' | 'last_month' | 'last_week' | 'last_day';

interface SearchInput {
    term: string;
    period: SearchPeriod;
    numPerPage?: string;
}

const searchArticles = (
    inputData: SearchInput,
    onSearchStart: () => void,
    onComplete: (timeline: NewsResult[]) => void,
    onError: () => void
) => {
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
    const [searchPeriod, setSearchPeriod] = useState<SearchPeriod>('last_year');
    const [numPerPage, setNumPerPage] = useState<string | undefined>(undefined);

    const onSearch = (inputData: SearchInput) => {
        searchArticles(inputData, onSearchStart, onSearchComplete, onSearchError);
    };

    const onSearchTermChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
        setSearchTerm(ev.currentTarget.value);

    const onSearhPeriodSelect = (ev: SyntheticEvent<EventTarget & HTMLSelectElement>) =>
        setSearchPeriod(ev.currentTarget.value as SearchPeriod);

    const onNumDataChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setNumPerPage(ev.currentTarget.value);
    };

    const periods: { [key: string]: string } = {
        last_year: 'Рік',
        last_month: 'Місяць',
        last_week: 'Тиждень',
        last_day: 'День',
        custom: 'Кастомного ніт!',
    };

    return (
        <div className="search-block">
            <input
                className="search-input"
                placeholder="Введіть, шо вам там треба..."
                onChange={onSearchTermChange}
            />
            <select className="select-period" value={searchPeriod} onChange={onSearhPeriodSelect}>
                {Object.keys(periods).map((x) => (
                    <option value={x} disabled={x === 'custom'}>
                        {periods[x]}
                    </option>
                ))}
            </select>
            <input
                type="number"
                value={numPerPage}
                className="select-num"
                onChange={onNumDataChange}
            ></input>
            <button
                className="search-btn"
                onClick={() =>
                    onSearch({
                        term: searhTerm,
                        period: searchPeriod,
                        numPerPage,
                    })
                }
                disabled={!searhTerm}
            >
                Вйо до подій!
            </button>
        </div>
    );
};
