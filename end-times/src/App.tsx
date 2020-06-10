import React, { useState } from 'react';
import Loader from 'react-loader-spinner';
import './App.css';
import { TimeLine } from './Timeline';
import { Search } from './Search';
import { NewsResult } from './types';
import { NotFound, Empty } from './Empty';

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

function App() {
    const [loading, setLoading] = useState(false);
    const [timelinedata, setTimeLineData] = useState<NewsResult[] | null>(null);

    const onSearchComplete = (data: NewsResult[]) => {
        setLoading(false);
        setTimeLineData(data);
    };

    return (
        <div className="main">
            {loading ? (
                <div className="loader">
                    <Loader type="Grid" color="rgb(33, 150, 243)" height={100} width={100} />
                </div>
            ) : (
                <>
                    <Search
                        onSearchStart={() => setLoading(true)}
                        onSearchComplete={onSearchComplete}
                        onSearchError={() => setTimeLineData(null)}
                    />
                    {timelinedata ? <TimeLine data={timelinedata} /> : <Empty />}
                </>
            )}
        </div>
    );
}

export default App;
