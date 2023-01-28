/*global chrome*/
import React, { useState, useEffect } from 'react';
import Home from './Home';
import Options from './Options';
import About from './About';
import { TabWindow, Tab } from './../components/TabWindow';
import './App.css';

function App() {
  const [tab, setTab] = useState('Home');
  const setAndSaveTab = (x) => {
    setTab(x);
    // writeSyncStorage('currentTab', x);
  };

  // useEffect(async () => {
  //   const savedTab = await readSyncStorage('currentTab');
  //   console.log(`Saved tab: ${savedTab}`);
  // }, [tab]);

  return (
    <div className='App'>
      <TabWindow onChange={setAndSaveTab} currentTab={tab}>
        <Tab tabName='Home' content={<Home />} />
        <Tab tabName='Options' content={<Options />} />
        <Tab tabName='About' content={<About />} />
      </TabWindow>
    </div>
  );
}

export default App;
