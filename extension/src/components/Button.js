import React from 'react';
import './Button.css'

function Button(props) {
  return (
    <a className='App-Button' href='#' onClick={props.onClick} style={props.style}>
      {props.children || props.content}
    </a>
  );
}

export default Button;