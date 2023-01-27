import React, { useState } from 'react';
import './Expander.css'

function Expander({ header, expanded, children, className }) {
  const [state, setExpandedState] = useState(expanded || false);
  const [headerComponent, setHeaderComponent] = useState(header(!state));
  const toggleExpander = () => {
    setExpandedState(x => {
      setHeaderComponent(header(x));
      return !x;
    })
  };

  return (
    <div className={`Expander ${className}`}>
      <div className='Expander-header'>
        <a className='Expander-header-link' href='#' onClick={toggleExpander}>
          {headerComponent}
        </a>
      </div>
      {state ? children : (<> </>)}
    </div>
  );
}

export default Expander;