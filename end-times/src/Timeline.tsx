import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import 'rc-tooltip/assets/bootstrap.css';
import './Timeline.css';
import React, { useState } from 'react';
import { NewsResult } from './types';
import { groupByDate } from './utils';

const TimelineElement = ({ link, date, title, thumbnail }: NewsResult) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => setExpanded(!expanded);

    return (
        <div onClick={toggleExpanded} className="timeline-article vertical-timeline-element">
            <VerticalTimelineElement
                date={date}
                iconStyle={{ backgroundImage: `url(${thumbnail})`, color: '#fff' }}
            >
                <h3 className="vertical-timeline-element-title timeline-head">{title}</h3>
                {expanded && (
                    <div className="timeline-details">
                        <a href={link} target="_blank">
                            вйо до новини!
                        </a>
                    </div>
                )}
            </VerticalTimelineElement>
        </div>
    );
};

export const TimeLine = ({ data }: { data: NewsResult[] }) => {
    const [yearExpanded, setYearExpanded] = useState<string[]>([]);
    const [monthExpanded, setMonthExpanded] = useState<string[]>([]);

    const toggleExpanded = (item: string, state: string[], toggler: (items: string[]) => void) => {
        const exp = state.includes(item) ? state.filter((x) => x !== item) : state.concat([item]);
        toggler(exp);
    };

    const groupedData = groupByDate(data);

    return (
        <VerticalTimeline layout={'2-columns'}>
            {Object.keys(groupedData).map((k) => {
                const yearIcon = Object.values(groupedData[k])[0][0].thumbnail;
                return (
                    <>
                        <div
                            onClick={() => toggleExpanded(k, yearExpanded, setYearExpanded)}
                            className="timeline-year"
                        >
                            <VerticalTimelineElement
                                date={k + ' н.е.'}
                                iconStyle={{
                                    backgroundImage: `url(${yearIcon})`,
                                    top: '14px',
                                }}
                            ></VerticalTimelineElement>
                        </div>
                        {yearExpanded.includes(k) && (
                            <div>
                                {Object.keys(groupedData[k]).map((j) => {
                                    const monthIcon = Object.values(groupedData[k][j])[0].thumbnail;
                                    return (
                                        <div>
                                            <div
                                                onClick={() =>
                                                    toggleExpanded(
                                                        k + j,
                                                        monthExpanded,
                                                        setMonthExpanded
                                                    )
                                                }
                                                className="timeline-month"
                                            >
                                                <VerticalTimelineElement
                                                    date={j}
                                                    iconStyle={{
                                                        backgroundImage: `url(${monthIcon})`,
                                                        top: '14px',
                                                    }}
                                                ></VerticalTimelineElement>
                                            </div>

                                            {monthExpanded.includes(k + j) &&
                                                groupedData[k][j].map(({ title, ...rest }, i) => (
                                                    <TimelineElement
                                                        {...{ title, ...rest }}
                                                        key={title + i}
                                                    />
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                );
            })}
        </VerticalTimeline>
    );
};
