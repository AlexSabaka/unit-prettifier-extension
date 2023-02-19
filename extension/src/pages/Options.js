/*global chrome*/
import React, { useState, useEffect } from 'react';
import './Options.css';
import { UnitMeasurementsTable } from './UnitMeasurementsTable';
import { defaultOptions, insertionsOptions } from '../utils/options';
import { useMemo } from 'react';



function Options() {
  const [globalOptions, setGlobalOptions] = useState({
    insertionOptions: '',
    processOnLoaded: false
  });
  const [unitOptions, setUnitOptions] = useState([]);

  const restoreDefaultUnits = () => {
    setUnitOptions(defaultOptions.units);
  };
  const handleGlobalOptionChange = (e) => {
    setGlobalOptions(v => {
      return {
        ...globalOptions,
        [e.target.name]: e.target.value,
      };
    });
  };
  const addNewUnit = function () {
    setUnitOptions(o => [
      ...o,
      { baseUnit: '', actualUnit: '', shortFor: '', plural: '', factor: '', offset: '' }
    ]);
  };
  const deleteUnit = function (k, u) {
    setUnitOptions(o => o.filter((x, i) => i !== k));
  };
  const editUnit = function (k, u) {
    setUnitOptions(o => [
      ...o.slice(0, k),
      u,
      ...o.slice(k + 1)
    ]);
  };
  const deleteAllUnits = function () {
    setUnitOptions([]);
  };
  
  useEffect(() => {
    chrome.storage.sync.get(['options'], (res) => {
      setUnitOptions(res.options.units || defaultOptions.units);
      setGlobalOptions({
        insertionOptions: res.options.insertionOptions || defaultOptions.insertionOptions,
        processOnLoaded: res.options.processOnLoaded || defaultOptions.processOnLoaded,
      });
    });
  }, []);

  useEffect(() => {
    const options = {
      units: unitOptions,
      ...globalOptions
    };
    chrome.storage.sync.set({ 'options': options });
  }, [globalOptions, unitOptions]);

  return (
    <div className='Options'>
      <h2>Options</h2>
      <p>Setup your conversion units and other options here</p>
      <div>
        <label>Select replacement style for found units</label>
        <select name="insertionOptions" value={globalOptions.insertionOptions} onChange={handleGlobalOptionChange} style={{ textTransform: "capitalize" }}>
          {insertionsOptions.map((x, i) => <option key={i} value={x}>{x.replace("_", " ")}</option>)}
        </select>
      </div>
      <div>
        <label>Process page when it's loaded</label>
        <input type="checkbox" name="processOnLoaded" defaultChecked={globalOptions.processOnLoaded} onChange={handleGlobalOptionChange}></input>
      </div>
      <br />
      <UnitMeasurementsTable
        units={unitOptions}
        onAdd={addNewUnit}
        onClear={deleteAllUnits}
        onChange={editUnit}
        onDelete={deleteUnit}
        onRestoreDefaults={restoreDefaultUnits}
      />
    </div>
  );
}

export default Options;
