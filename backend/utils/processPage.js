var Measure = require('./Measure');
var { JSDOM } = require('jsdom');

const Node = {
  TEXT_NODE: 3
};

function processLoadedPage(content, options) {
  let convertingTable = {};
  let regex = undefined;

  setupMeasures();

  regex = constructRegex();

  let jsdom = new JSDOM(content);
  let document = jsdom.window.document;

  deepSearchBodyNodes(document.body, regex);

  return document.body.innerHTML;

  function setupMeasures() {
    for (let key in options) {
      addUnit(options[key].baseUnit, options[key].actualUnit, toNumber(options[key].factor), toNumber(options[key].offset));
    }
  }

  function constructRegex() {
    const unitSizes = [
      'metric',
      'short',
      'long',
      'square',
      'cubic',
      'fluid',
      'degrees?',
      'US',
      'Imperial'
    ];
  
    const unitMultipliers = [
      'm', 'milli',
      'c', 'centi',
      'd', 'deci',
      'k', 'kilo'
    ];
    const units = collectUnitsFromOptions(options);

    const reducer = (acc, curr) => `${acc}|${curr}`;

    const number = '(?<number>[+-]?\\d[\\d\\s\\/,.]*)\\s*(?:[\\s-]*th|nd)?';
    const unitSize = '(?<unit_size>' + unitSizes.reduce(reducer) + ')?';
    const unitMultiplier = '(?<unit_mult>' + unitMultipliers.reduce(reducer) + ')?';
    const unit = '(?<unit>' + units.reduce(reducer) + ')';

    return new RegExp(`${number}[\\s-]?${unitSize}[\\s-]${unitMultiplier}${unit}`, 'gmi');
  }

  function collectUnitsFromOptions() {
    let units = [];
    const pushUnit = (u) => {
      if (u !== undefined && u.trim() !== '' && units.indexOf(u) < 0) {
        units.push(u.trim());
      }
    }
    const makePluralQuantifier = (p) => p === undefined || p === 'off' || p === false ? '' : 's?';
    for (let key in options) {
      pushUnit(options[key].baseUnit);
      pushUnit(options[key].actualUnit);
      pushUnit(options[key].shortFor + makePluralQuantifier(options[key].plural));
    }
    return units;
  }

  function deepSearchBodyNodes(node) {
    const children = node.childNodes;

    if (children.length === 0) {
      return replaceTextAndInsertChildren(node);
    }

    for (let child of children) {
      deepSearchBodyNodes(child);
    }
  }

  function replaceTextAndInsertChildren(node) {
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const renderers = searchAndReplaceUnitsWithRenderFunction(node.textContent);
    if (renderers.length > 0) {
      node.parentNode.replaceChild(createDivContainer(renderers), node);
    } 
  }

  function searchAndReplaceUnitsWithRenderFunction(text) {
    let m;
    let resultParts = [];
    let continueExec = true;

    while (continueExec) {
      m = regex.exec(text);
      if (m === null) {
        if (resultParts.length > 0) {
          resultParts.push(() => document.createTextNode(text));
        }

        continueExec = false;
        continue;
      }

      const match = m[0].slice(0, m[0].length - 1);
      const [dummy1, number, size, multiplier, unit] = m;

      const parts = text.split(match);

      resultParts.push(() => document.createTextNode(parts[0]));
      resultParts.push(() => createSpanTag(match, number, size, multiplier, unit));

      text = parts[1];
      regex.lastIndex = 0;
    }
    return resultParts;
  }

  function createSpanTag(match, number, size, multiplier, unit) {
    const [convertTo, convertFrom] = findBaseUnitForActualUnit(unit);
    if (convertTo === undefined || convertFrom === undefined) {
      return document.createTextNode(match);
    }

    const converted = convert(toNumber(number), convertFrom, convertTo);

    const span = document.createElement("span");
    span.style.borderBottom = '1px dotted lightgrey';
    span.style.color = 'black';
    span.title = `${converted} ${convertTo}`;
    span.appendChild(document.createTextNode(match));
    return span;
  }

  function createDivContainer(renderers) {
    const newDiv = document.createElement("div");
    renderers.forEach(e => newDiv.appendChild(e()));
    return newDiv;
  }

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

  function findBaseUnitForActualUnit(actualUnit) {
    
    for (let i = 0; i < options.length; ++i) {
      let k = options[i];
      if (k.actualUnit === actualUnit) {// || k.shortFor === actualUnit) {
        return [ k.baseUnit, k.actualUnit ];
      }
    }
    
    return [ undefined, undefined ];
  }

  function Measure(unit) {
    this.currentUnit = unit;
    this.factor = (x) => x;
    this.currentMultiplier = 1;

    this.to = function (targetUnit) {
      const fail = () => { throw new Error(`Cannot convert units from '${this.currentUnit}' to '${targetUnit}'`) };
      const indirectFactor = () => {
        const key = Object.keys(convertingTable[this.currentUnit])[0];
        const tempFactor = convertingTable[key][targetUnit];
        return (x) => convertingTable[this.currentUnit][key](x) * tempFactor(x);
      };

      this.factor = convertingTable[this.currentUnit][targetUnit] || indirectFactor() || fail();
      return this;
    };

    this.multiplier = function (mult) {
      if (mult === undefined) {
        return this;
      }

      const prefixes = ['T', 'G', 'M', 'k', '', 'd', 'c', 'm', 'u', 'n'];
      const factors = [12, 9, 6, 3, 0, -1, -2, -3, -6, -9];
      const index = prefixes.indexOf(mult);

      this.currentMultiplier = index > 0 ? Math.pow(10, factors[index]) : 1;
      return this;
    };

    this.convert = function (value) {
      return this.factor(value) * this.currentMultiplier;
    };
  }

  function addUnit(baseUnit, actualUnit, multiplier, offset) {
    function _add(bu, au, m, o) {
      convertingTable[au] = convertingTable[au] || {};
      convertingTable[au][bu] = (x) => m * x + o;
    }

    _add(baseUnit, actualUnit, multiplier, offset);
    _add(actualUnit, baseUnit, 1 / multiplier, -offset / multiplier);
  }

  function convert(value, from, to, multiplier = undefined, fractionDigits = 2) {
    console.log(`Converting value ${value} from '${from}' to '${to}' with function '${convertingTable[from][to]}'`)
    return new Measure(from).to(to).multiplier(multiplier).convert(value).toFixed(fractionDigits);
  }
}


function processPage(content, options) {
  let measure = new Measure(options);
  // TODO: Next time use pegJS grammar
  let regex = constructRegex(options);
  let dom = new JSDOM(content);

  // let body = dom.document.body; //querySelector("body");
  console.log(dom._document);

  deepSearchBodyNodes(body, regex);

  function deepSearchBodyNodes(node) {
    const children = node.childNodes;
  
    if (children.length === 0) {
      return replaceTextAndInsertChildren(node);
    }
  
    for (let child of children) {
      deepSearchBodyNodes(child);
    }
  }
  
  function replaceTextAndInsertChildren(node) {
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }
  
    const renderers = searchAndReplaceUnitsWithRenderFunction(node.textContent);
    if (renderers.length > 0) {
      node.parentNode.replaceChild(createDivContainer(renderers), node);
    } 
  }
  
  function searchAndReplaceUnitsWithRenderFunction(text) {
    let m;
    let resultParts = [];
    let continueExec = true;
  
    while (continueExec) {
      m = regex.exec(text);
      if (m === null) {
        if (resultParts.length > 0) {
          resultParts.push(() => document.createTextNode(text));
        }
  
        continueExec = false;
        continue;
      }
  
      const match = m[0].slice(0, m[0].length - 1);
      const [dummy1, number, size, multiplier, unit] = m;
  
      const parts = text.split(match);
  
      resultParts.push(() => document.createTextNode(parts[0]));
      resultParts.push(() => createSpanTag(match, number, size, multiplier, unit));
  
      text = parts[1];
      regex.lastIndex = 0;
    }
    return resultParts;
  }
  
  function createSpanTag(match, number, size, multiplier, unit) {
    const [convertTo, convertFrom] = findBaseUnitForActualUnit(unit);
    console.log(match, number, size, multiplier, unit, convertTo, convertFrom);
    if (convertTo === undefined || convertFrom === undefined) {
      return document.createTextNode(match);
    }
  
    const converted = Measure.convert(toNumber(number), convertFrom, convertTo);
  
    const span = document.createElement("span");
    span.style = {
      borderBottom: '1px dotted lightgrey',
      color: 'black',
    };
    span.title = `${converted} ${convertTo}`;
    span.appendChild(document.createTextNode(match));
    return span;
  }
  
  function createDivContainer(renderers) {
    const newDiv = document.createElement("div");
    renderers.forEach(e => newDiv.appendChild(e()));
    return newDiv;
  }
  
  function findBaseUnitForActualUnit(actualUnit) {
    const unitConfig = options[actualUnit]
                    || options[Object.keys(options).find(k => actualUnit?.startsWith(options[k].shortFor))];
    return [ unitConfig?.baseUnit, unitConfig?.actualUnit ];
  }
  
  function collectUnitsFromOptions(options) {
    let units = [];
    const pushUnit = (u) => {
      if (u !== undefined && u.trim() !== '' && units.indexOf(u) < 0) {
        units.push(u.trim());
      }
    }
    const makePluralQuantifier = (p) => p === undefined || p === 'off' || p === false ? '' : 's?';
    for (let key in options) {
      pushUnit(options[key].baseUnit);
      pushUnit(options[key].actualUnit);
      pushUnit(options[key].shortFor + makePluralQuantifier(options[key].plural));
    }
    return units;
  }
  
  function constructRegex(options) {
    const unitSizes = [
      'metric',
      'short',
      'long',
      'square',
      'cubic',
      'fluid',
      'degrees?',
      'US',
      'Imperial'
    ];
  
    const unitMultipliers = [
      'm', 'milli',
      'c', 'centi',
      'd', 'deci',
      'k', 'kilo'
    ];
    const units = collectUnitsFromOptions(options);
  
    const reducer = (acc, curr) => `${acc}|${curr}`;
  
    const number = '(?<number>[+-]?\\d[\\d\\s\\/,.]*)\\s*(?:[\\s-]*th|nd)?';
    const unitSize = '(?<unit_size>' + unitSizes.reduce(reducer) + ')?';
    const unitMultiplier = '(?<unit_mult>' + unitMultipliers.reduce(reducer) + ')?';
    const unit = '(?<unit>' + units.reduce(reducer) + ')';
  
    return new RegExp(`${number}[\\s-]?${unitSize}[\\s-]${unitMultiplier}${unit}\\W`, 'gmi');
  }
}

module.exports = processLoadedPage;