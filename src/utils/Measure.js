
export default class Measure {
  constructor(unit) {
    this.currentUnit = unit;
    this.factor = (x) => x;
    this.currentMultiplier = 1;
  }

  to(targetUnit) {
    const fail = () => { throw new Error(`Cannot convert units from '${this.currentUnit}' to '${targetUnit}'`); };
    const indirectFactor = () => {
      const key = Object.keys(Measure.convertingTable[this.currentUnit])[0];
      const tempFactor = Measure.convertingTable[key][targetUnit];
      return (x) => Measure.convertingTable[this.currentUnit][key](x) * tempFactor(x);
    };

    this.factor = Measure.convertingTable[this.currentUnit][targetUnit] || indirectFactor() || fail();
    return this;
  };

  multiplier(mult) {
    if (mult === undefined) {
      return this;
    }

    const prefixes = ['T', 'G', 'M', 'k', '', 'd', 'c', 'm', 'u', 'n'];
    const factors = [12, 9, 6, 3, 0, -1, -2, -3, -6, -9];
    const index = prefixes.indexOf(mult);

    this.currentMultiplier = index > 0 ? Math.pow(10, factors[index]) : 1;
    return this;
  };

  convert(value) {
    return this.factor(value) * this.currentMultiplier;
  }

  static convertingTable = { };
  static addUnit(baseUnit, actualUnit, multiplier, offset) {
    function _add(bu, au, m, o) {
      Measure.convertingTable[au] = Measure.convertingTable[au] || {};
      Measure.convertingTable[au][bu] = (x) => m * x + o;
    }

    _add(baseUnit, actualUnit, multiplier, offset);
    _add(actualUnit, baseUnit, 1 / multiplier, -offset / multiplier);
  }

  static convert = function (value, from, to, multiplier = undefined, fractionDigits = 2) {
    return new Measure(from).to(to).multiplier(multiplier).convert(value).toFixed(fractionDigits);
  }
}
