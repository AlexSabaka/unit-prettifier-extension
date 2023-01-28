
function toNumber(s) {
  const fractionNumberRegex = /[+-]?((?:\d[\d,\.]*\s)*)(\d[\d,\.]*)\/(\d[\d,\.]*)/gm;
  s = s.toString().replace(',', '');
  const fractionMatch = fractionNumberRegex.exec(s);
  if (fractionMatch !== null) {
    const fractionDivisor = new Number(fractionMatch[2]);
    const fractionDivider = new Number(fractionMatch[3]);
    const wholeParts = new Number(fractionMatch[1]);
    return (wholeParts * fractionDivider + fractionDivisor) / fractionDivider;
  }
  return new Number(s.replace(' ', ''));
}


class Measure {
  constructor(options) {
    this.setupMeasures(options || []);
  }

  setupMeasures(options) {
    let ct = this.convertingTable || {};
    for (let key in options) {
      addUnit(options[key].baseUnit, options[key].actualUnit, toNumber(options[key].factor), toNumber(options[key].offset));
    }
    this.convertingTable = ct;

    function addUnit(baseUnit, actualUnit, multiplier, offset) {
      function _add(bu, au, m, o) {
        ct[au] = ct[au] || {};
        ct[au][bu] = (x) => m * x + o;
      }
      _add(baseUnit, actualUnit, multiplier, offset);
      _add(actualUnit, baseUnit, 1 / multiplier, -offset / multiplier);
    }
  }

  toUnit(targetUnit) {
    const fail = () => { throw new Error(`Cannot convert units from '${this.currentUnit}' to '${targetUnit}'`); };
    const indirectFactor = () => {
      const key = Object.keys(this.convertingTable[this.currentUnit])[0];
      const tempFactor = this.convertingTable[key][targetUnit];
      return (x) => this.convertingTable[this.currentUnit][key](x) * tempFactor(x);
    };

    this.targetUnit = targetUnit;
    this.factor = this.convertingTable[this.currentUnit][targetUnit] || indirectFactor() || fail();
    return this;
  };

  fromUnit(sourceUnit) {
    this.currentUnit = sourceUnit;
    return this;
  }

  value(v, digits) {
    let result = this.currentUnit === this.targetUnit ? v : this.factor(v);
    let digitsFactor = Math.pow(10, digits || 2);
    return Math.round(result * digitsFactor) / digitsFactor;
  }
}

module.exports = Measure;