import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { TimeLine } from './Timeline';
import { Search } from './Search';
import { NewsResult } from './resl';

function App() {
    const [timelinedata, setTimeLineData] = useState<NewsResult[] | null>(null);
    return (
        <>
            <Search
                onSearchComplete={setTimeLineData}
                onSearchError={() => setTimeLineData(null)}
            />
            <TimeLine data={timelinedata} />
        </>
    );
}

export default App;
