import React from 'react';
import Button from './../components/Button';
import './UnitHeader.css'


export function UnitHeader({ collapsed, unitName, onDelete }) {
  const onDeleteButtonClick = (e) => {
    e.stopPropagation();
    onDelete();
  };
  return (
    <div className='Unit-Header'>
      <div className='Unit-Header-Text'>{`${collapsed ? 'Expand' : 'Collapse'} (${unitName})`}</div>
      <Button onClick={onDeleteButtonClick}>
        <div>Delete</div>
      </Button>
    </div>
  );
}
