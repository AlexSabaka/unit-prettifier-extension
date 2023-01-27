/*global chrome*/
import React, { useState } from 'react';
import LinkButton from './LinkButton';
import './TabWindow.css';

export function Tab({ tabName, content }) {
  // This is a placeholder component for storing in it's
  // props object the tabName and actual tab content
  return <></>;
}

export function TabWindow({ children, onChange, currentTab }) {
  const [current, setCurrentTab] = useState(currentTab);
  const setCurrentTabAndTriggerOnChange = (tab) => {
    setCurrentTab(tab);
    onChange(tab);
  };

  const navLinks = React.Children.map(children, (child, index) => {
    const { tabName } = child.props;
    return <LinkButton key={index} onClick={() => setCurrentTabAndTriggerOnChange(tabName)} content={tabName} />;
  });

  const tabs = React.Children.toArray(children).reduce((map, child) => {
    const { tabName, content } = child.props;
    return { ...map, [tabName]: content };
  }, { });

  return (
    <div className='Tab'>
      <header className='Tab-navigation'>
        { navLinks }
      </header>
      <main className='Tab-content'>
        { tabs[current] || <h6>Select tab...</h6> }
      </main>
    </div>
  );
}