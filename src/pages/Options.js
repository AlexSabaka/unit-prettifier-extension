/*global chrome*/
import React, { useState, useEffect } from 'react';
import { readSyncStorage, writeSyncStorage } from '../utils/chromeUtils';
import Button from './../components/Button';
import Expander from './../components/Expander';
import './Options.css';

function UnitHeader({ collapsed, unitName, onDelete }) {
  return (
    <div style={{ display: 'grid', columns: 2 }}>
      <div>{(collapsed ? 'Expand' : 'Collapse') + ` (${unitName})`}</div>
      <Button onClick={onDelete} content='-' style={{ color: 'red', width: '15px', height: '15px' }} />
    </div>
  );
}

function UnitMeasureTableRow(props) {
  const [ value, setValue ] = useState(props.value);
  const { onChange, onDelete } = props;

  const handleChange = (e) => {
    setValue(v => {
      const newValue = { ...v, [e.target.name]: e.target.value };
      onChange(props.id, newValue);
      return newValue;
    });
  };

  return (
    <div className='Options-measure-unit'>
      <Expander header={
        x => <UnitHeader collapsed={x} unitName={value.shortFor || value.actualUnit} onDelete={() => onDelete(props.id, value)} />
      } >
        <div>
          <label>Base Unit</label><input type="text" name="baseUnit" value={value.baseUnit} onChange={handleChange} /><br />
          <label>Actual Unit</label><input type="text" name="actualUnit" value={value.actualUnit} onChange={handleChange} /><br />
          <label>Shortened For</label><input type="text" name="shortFor" value={value.shortFor} onChange={handleChange} /><br />
          <label>Allow Plural</label><input type="checkbox" name="plural" checked={value.plural} onChange={handleChange} /><br />
          <label>Coefficient</label><input type="text" name="factor" value={value.factor} onChange={handleChange} /><br />
          <label>Offset (optional)</label><input type="text" name="offset" value={value.offset} onChange={handleChange} /><br />
        </div>
      </Expander>
    </div>
  );
}

function UnitMeasurementsTable({ options, onAdd, onClear, onDelete, onChange }) {
  return (
    <div>
      <div className='Measure-unit-buttons'>
        <Button onClick={onAdd} content='Add unit...' disabled />
        <Button onClick={onClear} content='Delete all' style={{ color: 'red' }} disabled={Object.keys(options).length === 0} />
      </div>
      <div className='Options-table'>
        {options.map((v, k) => { return <UnitMeasureTableRow key={k} id={k} value={v} onDelete={onDelete} onChange={onChange} /> })}
      </div>
    </div>
  );
}

function Options() {
  const [options, setOptions] = useState([
    { baseUnit: 'g', actualUnit: 'lb', shortFor: 'pound', plural: true, factor: '432', offset: '0' },
    { baseUnit: 'g', actualUnit: 'oz', shortFor: 'ounce', plural: true, factor: '28.35', offset: '0' }
  ]);
  const saveOptions = () =>
    writeSyncStorage('opts', options.reduce((acc, c) => {
      return { ...acc, [c.actualUnit]: c };
    }, { })); 
  const addNewUnit = () =>
    setOptions(o => [
      ...o,
      { baseUnit: '', actualUnit: '', shortFor: '', plural: '', factor: '', offset: '' }
    ]);
  const deleteUnit = (k, u) =>
    setOptions(o => [
      ...o.slice(0, k),
      ...o.slice(k + 1, o.length)
    ]);
  const editUnit = (k, u) =>
    setOptions(o => [
      ...o.slice(0, k),
      u,
      ...o.slice(k + 1, o.length)
    ]);
  const deleteAllUnits = () => setOptions([]);

  // useEffect(async () => {
  //   try {
  //     const opts = await readSyncStorage('opts');
  //     setOptions(Object.keys(opts).reduce((acc, c) => [...acc, c], []));
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  return (
    <div className='Options'>
      <p>Setup your conversion units here :)</p>
      <div>
        <UnitMeasurementsTable
          options={options}
          onAdd={addNewUnit}
          onClear={deleteAllUnits}
          onChange={editUnit}
          onDelete={deleteUnit}
        />
      </div>
    </div>
  );
}

export default Options;
