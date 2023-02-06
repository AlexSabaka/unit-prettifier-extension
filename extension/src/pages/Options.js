/*global chrome*/
import React, { useState, useEffect } from 'react';
import Button from './../components/Button';
import Expander from './../components/Expander';
import './Options.css';

const defaultOptions = [
  {
    "baseUnit": "g",
    "actualUnit": "lb",
    "shortFor": "pound",
    "plural": true,
    "factor": 432,
    "offset": 0.0
  }, {
    "baseUnit": "g",
    "actualUnit": "oz",
    "shortFor": "ounce",
    "plural": true,
    "factor": 28.3495,
    "offset": 0.0
  }, {
    "baseUnit": "C",
    "actualUnit": "F",
    "shortFor": "Fahrenheit",
    "plural": true,
    "factor":  0.5555555555555556,
    "offset": -17.777
  }, {
    "baseUnit": "ml",
    "shortFor": "cup",
    "plural": true,
    "factor":  200,
    "offset": 0
  }, {
    "baseUnit": "ml",
    "shortFor": "tablespoon",
    "plural": true,
    "factor":  12,
    "offset": 0
  }, {
    "baseUnit": "ml",
    "shortFor": "teaspoon",
    "plural": true,
    "factor":  2.5,
    "offset": 0
  } ];

function UnitHeader({ collapsed, unitName, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div>{`${collapsed ? 'Expand' : 'Collapse'} (${unitName})`}</div>
      <Button onClick={onDelete} style={{ color: 'red', width: '0.5rem', height: '0.5rem', marginLeft: '10rem' }}>
        <div style={{ marginLeft: '-0.3rem', marginTop: '-0.8rem'}}>x</div>
      </Button>
    </div>
  );
}

function UnitMeasureTableRow(props) {
  const [ value, setValue ] = useState(props.value);
  const { id, onChange, onDelete, disabled } = props;

  const handleChange = (e) => {
    setValue(v => {
      const newValue = { ...v, [e.target.name]: e.target.value };
      onChange(id, newValue);
      return newValue;
    });
  };

  return (
    <div className='Options-measure-unit'>
      <Expander header={
        x => <UnitHeader collapsed={x} unitName={value.shortFor || value.actualUnit} onDelete={() => onDelete(props.id, value)} />
      } >
        <div>
          <label>Base Unit</label><input disabled={disabled} type="text" name="baseUnit" value={value.baseUnit} onChange={handleChange} /><br />
          <label>Actual Unit</label><input disabled={disabled} type="text" name="actualUnit" value={value.actualUnit} onChange={handleChange} /><br />
          <label>Shortened For</label><input disabled={disabled} type="text" name="shortFor" value={value.shortFor} onChange={handleChange} /><br />
          <label>Allow Plural</label><input disabled={disabled} type="checkbox" name="plural" checked={value.plural} onChange={handleChange} /><br />
          <label>Coefficient</label><input disabled={disabled} type="text" name="factor" value={value.factor} onChange={handleChange} /><br />
          <label>Offset (optional)</label><input disabled={disabled} type="text" name="offset" value={value.offset} onChange={handleChange} /><br />
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
  const [options, setOptions] = useState(defaultOptions);

  // const saveOptions = () => chrome.storage.sync.set({ 'options': options });

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
  const deleteAllUnits = () =>
    setOptions([]);

  // useEffect(() => {
  //   try {
  //     chrome.storage.sync.get(['options'], function (result) {
  //       if (result === undefined || result === null || result.length === 0) {
  //         chrome.storage.sync.set({ 'options': defaultOptions });
  //         setOptions(defaultOptions);
  //       }
  //       setOptions(result);
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  return (
    <div className='Options'>
      <p>Setup your conversion units here</p>
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
