import React from 'react';
import './LinkButton.css'

function LinkButton(props) {
  return (
    <a className='App-LinkButton' href='#' onClick={props.onClick} style={props.style}>
      {props.content}
    </a>
  );
}

export default LinkButton;