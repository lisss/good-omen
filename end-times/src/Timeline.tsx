import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import 'rc-tooltip/assets/bootstrap.css';
import React, { useState } from 'react';
import Tooltip from 'rc-tooltip';

interface TimelineElementProps {
    date: string;
    title: string;
    details?: string;
}

const TimelineElement = ({ date, title, details }: TimelineElementProps) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => setExpanded(!expanded);

    return (
        <div onClick={toggleExpanded} className="vertical-timeline-element">
            <VerticalTimelineElement
                date={date}
                iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                // icon={<WorkIcon />}
            >
                <Tooltip overlay={details} placement="bottom">
                    <h3 className="vertical-timeline-element-title">{title}</h3>
                </Tooltip>
                {expanded && <p>{details}</p>}
            </VerticalTimelineElement>
        </div>
    );
};

const data: TimelineElementProps[] = [
    {
        date: '03.03.2020',
        title: 'title 1',
        details: 'details 1',
    },
    {
        date: '02.04.2020',
        title: 'title 2',
        details: 'details 2',
    },
    {
        date: '06.04.2020',
        title: 'title 3',
    },
];

export const TimeLine = () => (
    <VerticalTimeline layout={'2-columns'}>
        {data.map(({ date, title, details }) => (
            <TimelineElement {...{ date, title, details }} key={date} />
        ))}
    </VerticalTimeline>
);
