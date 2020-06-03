import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { TimeLine } from './Timeline';
import { search } from './search';

function App() {
    return (
        <>
            <button onClick={search}>click me</button>
            <TimeLine />
        </>
    );
}

export default App;
