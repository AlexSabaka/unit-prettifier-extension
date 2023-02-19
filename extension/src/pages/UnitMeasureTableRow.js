import React, { useState } from 'react';
import Expander from './../components/Expander';
import { UnitHeader } from "./UnitHeader";


export function UnitMeasureTableRow(props) {
  const [value, setValue] = useState(props.value);
  const { id, onChange, onDelete, disabled } = props;

  const optionStylings = { marginBottom: '0.2rem', borderBottom: '0.1rem dashed #32363f' };

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
        x => <UnitHeader collapsed={x} unitName={value.shortFor || value.actualUnit} onDelete={() => onDelete(props.id, value)} />}>
        <div>
          <div style={optionStylings}><label>Base Unit</label><input disabled={disabled} type="text" name="baseUnit" value={value.baseUnit} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Actual Unit</label><input disabled={disabled} type="text" name="actualUnit" value={value.actualUnit} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Shortened For</label><input disabled={disabled} type="text" name="shortFor" value={value.shortFor} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Allow Plural</label><input disabled={disabled} type="checkbox" name="plural" defaultChecked={value.plural} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Allow Rescaling</label><input disabled={disabled} type="checkbox" name="rescale" defaultChecked={value.rescale} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Coefficient</label><input disabled={disabled} type="text" name="factor" value={value.factor} onChange={handleChange} /></div>
          <div style={optionStylings}><label>Offset (optional)</label><input disabled={disabled} type="text" name="offset" value={value.offset} onChange={handleChange} /></div>
        </div>
      </Expander>
    </div>
  );
}
