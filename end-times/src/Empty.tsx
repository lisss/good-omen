import React from 'react';
import NoResults from './images/not_found.png';
import NoSearch from './vjo.jpg';

export const NotFound = () => (
    <div className="not-found">
        <div
            style={{
                height: 200,
                width: 200,
                backgroundImage: `url(${NoResults}`,
            }}
        />
        <div>Сорян, за вашим запитом щось нічого не знайшлось...</div>
    </div>
);

export const Empty = () => (
    <>
        <div className="empty">
            <div
                style={{
                    minHeight: 781,
                    backgroundImage: `url(${NoSearch}`,
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </div>
        <div>Вйо до пошуку!</div>
    </>
);
