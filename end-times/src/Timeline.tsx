import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import 'rc-tooltip/assets/bootstrap.css';
import './Timeline.css';
import React, { useState } from 'react';
import { NewsResult } from './resl';
import Tooltip from 'rc-tooltip';

const TimelineElement = ({ link, date, title, thumbnail }: NewsResult) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => setExpanded(!expanded);

    return (
        <div onClick={toggleExpanded} className="vertical-timeline-element">
            <Tooltip overlay="eee">
                <VerticalTimelineElement
                    date={date}
                    iconStyle={{ backgroundImage: `url(${thumbnail})`, color: '#fff' }}
                >
                    <h3 className="vertical-timeline-element-title timeline-head">{title}</h3>
                    {expanded && (
                        <div className="timeline-details">
                            <a href={link} target="_blank">
                                читати
                            </a>
                        </div>
                    )}
                </VerticalTimelineElement>
            </Tooltip>
        </div>
    );
};

export const TimeLine = ({ data }: { data: NewsResult[] | null }) =>
    data && (
        <VerticalTimeline layout={'2-columns'}>
            {data.map(({ date, ...rest }, i) => (
                <TimelineElement {...{ date, ...rest }} key={date + i} />
            ))}
        </VerticalTimeline>
    );
