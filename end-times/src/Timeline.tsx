import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import 'rc-tooltip/assets/bootstrap.css';
import './Timeline.css';
import React, { useState } from 'react';
import Tooltip from 'rc-tooltip';

interface TimelineElementProps {
    url: string;
    date: string;
    title: string;
}

const TimelineElement = ({ url, date, title }: TimelineElementProps) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => setExpanded(!expanded);

    return (
        <div onClick={toggleExpanded} className="vertical-timeline-element">
            <VerticalTimelineElement
                date={date}
                iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                // icon={<WorkIcon />}
            >
                <h3 className="vertical-timeline-element-title timeline-head">{title}</h3>
                {expanded && (
                    <div className="timeline-details">
                        <a href={url} target="_blank">
                            читати
                        </a>
                    </div>
                )}
            </VerticalTimelineElement>
        </div>
    );
};

const data: TimelineElementProps[] = [
    {
        url:
            'https://ua.korrespondent.net/ukraine/4220520-opublikovanyi-film-rik-prezydenta-zelenskoho',
        date: '4/22/2020',
        title: 'Опублікований фільм Рік президента Зеленського',
    },
    {
        url:
            'https://ua.korrespondent.net/ukraine/politics/4220436-zelenskyi-proviv-zustrich-z-saakashvili',
        date: '4/22/2020',
        title: 'Зеленський провів зустріч з Саакашвілі',
    },
    {
        url:
            'https://ua.korrespondent.net/business/financial/4219227-zelenskyi-skhvalyv-zminy-do-buidzhetu-cherez-COVID',
        date: '18/04/2020',
        title: 'Зеленський схвалив зміни до бюджету через COVID',
    },
    {
        url:
            'https://ua.korrespondent.net/ukraine/4201080-zelenskyi-proviv-perestanovky-v-natsradi-z-tb-i-radio',
        date: '5/03/2020',
        title: 'Зеленський провів перестановки в Нацраді з ТБ і радіо',
    },
];

export const TimeLine = () => (
    <VerticalTimeline layout={'2-columns'}>
        {data.map(({ url, date, title }) => (
            <TimelineElement {...{ url, date, title }} key={date} />
        ))}
    </VerticalTimeline>
);
