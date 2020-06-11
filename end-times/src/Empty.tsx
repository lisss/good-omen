import React from 'react';
import NoResults from './images/not_found.png';
import NoSearch from './images/shchur.png';

export const NotFound = () => (
    <div className="not-found">
        <img src={NoResults} className="not-found-img" />
        <div>Вибачте, нічого не знайшлось або щось пішло не так... Спробуйте ще</div>
    </div>
);

export const Empty = () => (
    <div className="empty">
        <img src={NoSearch} className="empty-img" />
    </div>
);
