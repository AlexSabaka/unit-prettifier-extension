import React from 'react';
import Button from './../components/Button';
import { UnitMeasureTableRow } from "./UnitMeasureTableRow";

export function UnitMeasurementsTable({ units, onAdd, onClear, onDelete, onRestoreDefaults, onChange }) {
  return (
    <div>
      <div className='Measure-unit-buttons'>
        <Button onClick={onAdd} content='Add unit' disabled />
        <Button onClick={onClear} content='Delete all' style={{ color: 'rgb(189, 71, 71)' }} disabled={Object.keys(units).length === 0} />
        <Button onClick={onRestoreDefaults} content='Restore defaults' />
      </div>
      <div className='Options-table'>
        {units.map((v, k) => { return <UnitMeasureTableRow key={k} id={k} value={v} onDelete={onDelete} onChange={onChange} />; })}
      </div>
    </div>
  );
}
