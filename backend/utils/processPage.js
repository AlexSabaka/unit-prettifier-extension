var Measure = require('./Measure');
var { JSDOM } = require('jsdom');

var fetch = import('node-fetch');
//var fetch = import('node-fetch')

const Node = {
  TEXT_NODE: 3
};

function fetchAndProcessPage(url, options) {
  return import('node-fetch')
    .then(fetch => fetch.default(url, { method: 'GET' }))
    .then(res => res.text())
    .then(res => processLoadedPage(res, options))
    .catch(err => console.error(err));
}

function processLoadedPage(content, options) {
  options = options || {};
  let measure = new Measure(options);
  let regex = undefined;
  let document = undefined;

  regex = constructRegex();

  document = new JSDOM(content).window.document; 
  deepSearchBodyNodes(document.body, regex);

  return document.body.innerHTML;


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

    let regex = new RegExp(`${number}[\\s-]?${unitSize}[\\s-]?${unitMultiplier}${unit}`, 'gmi');
    return regex;
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
      options[key].baseUnit && pushUnit(options[key].baseUnit);
      options[key].actualUnit && pushUnit(options[key].actualUnit);
      options[key].shortFor && pushUnit(options[key].shortFor + makePluralQuantifier(options[key].plural));
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

  function convert(value, from, to, multiplier = undefined, fractionDigits = 2) {
    console.log(`Converting value ${value} from '${from}' to '${to}'`)
    return measure.fromUnit(from).toUnit(to).value(value).toFixed(fractionDigits);
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

module.exports = fetchAndProcessPage;