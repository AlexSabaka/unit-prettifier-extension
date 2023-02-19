const unitSizes = [
  "metric",
  "short",
  "long",
  "square",
  "sq.?",
  "²",
  "³",
  "cubic",
  "cu\.?",
  "fluid",
  "degrees?",
  "deg\.?",
  "°",
  "º",
  "US",
  "Imperial",
];

const unitMultipliers = [
  {
    quantifiers: [ "n", "nano" ],
    multiplier: 1e-9,
  },
  {
    quantifiers: [ "u", "μ", "micro" ],
    multiplier: 1e-6,
  },
  {
    quantifiers: [ "m", "milli" ],
    multiplier: 1e-3,
  },
  {
    quantifiers: [ "c", "centi" ],
    multiplier: 1e-2,
  },
  {
    quantifiers: [ "d", "deci" ],
    multiplier: 1e-1,
  },
  {
    quantifiers: [ "k", "kilo" ],
    multiplier: 1e3,
  },
  {
    quantifiers: [ "M", "mega" ],
    multiplier: 1e6,
  },
  {
    quantifiers: [ "G", "giga" ],
    multiplier: 1e9,
  },
];

function constructRegex(unitOptions) {
  const units = collectUnitsFromOptions(unitOptions);

  const reducer = (acc, curr) => acc === "" ? curr : `${acc}|${curr}`;
  const multipliersReducer = (acc, curr) => acc === "" ? curr.quantifiers.reduce(reducer, "") : `${acc}|${curr.quantifiers.reduce(reducer, "")}`;

  const number = "(?<number>[+-]?\\d[\\d\\s\\/,.¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]*)\\s*(?:[\\s-]*th|nd)?";
  const unitMultiplier = "(?<unit_mult>" + unitMultipliers.reduce(multipliersReducer, "") + ")?";
  const unitSize = "(?<unit_size>" + unitSizes.reduce(reducer, "") + ")?";
  const unit = "(?<unit>" + units.reduce(reducer, "") + ")";

  let regex = new RegExp(`${number}[\\s-]?${unitSize}[\\s-]?${unitMultiplier}${unit}`, "gmi");
  return regex;
}

function collectUnitsFromOptions(unitOptions) {
  let units = [];
  const pushUnit = (u) => {
    if (u !== undefined && u.trim() !== "" && units.indexOf(u) < 0) {
      units.push(u.trim());
    }
  };
  const makePluralQuantifier = (p) =>
    p === undefined || p === "off" || p === false ? "" : "s?";
  for (let key in unitOptions) {
    unitOptions[key].actualUnit && pushUnit(unitOptions[key].actualUnit);
    unitOptions[key].shortFor && pushUnit(unitOptions[key].shortFor + makePluralQuantifier(unitOptions[key].plural));
  }
  return units;
}

function deepSearchBodyNodes(node, regex, measure, options) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      for (let child = node.firstChild; child !== null; child = child.nextSibling) {
        if (/SCRIPT|STYLE|IMG|NOSCRIPT|TEXTAREA|CODE/ig.test(child.nodeName) === false) {
          deepSearchBodyNodes(child, regex, measure, options);
        }
      }
      break;
    case Node.TEXT_NODE:
      if (/\S/gm.test(node.textContent)) {
        console.log(`Trying to apply changes in node:`, node);
        replaceTextAndInsertChildren(node, regex, measure, options);
      }
      break;
    default:
      break;
  }
}

function replaceTextAndInsertChildren(node, regex, measure, options) {
  const renderers = searchAndReplaceUnitsWithRenderFunction(node.textContent, regex, measure, options);
  if (renderers.length > 0) {
    node.parentNode.replaceChild(createDivContainer(renderers), node);
  }
}

function searchAndReplaceUnitsWithRenderFunction(text, regex, measure, options) {
  let resultParts = [];
  let continueExec = true;

  while (continueExec) {
    let m = regex.exec(text);
    if (m === null) {
      if (resultParts.length > 0) {
        resultParts.push(() => document.createTextNode(text));
      }

      continueExec = false;
      continue;
    }

    console.log(`Found match ${m}`);

    const match = m[0].slice(0, m[0].length);
    const [dummy1, number, size, multiplier, unit] = m;

    const parts = text.split(match);

    resultParts.push(() => document.createTextNode(parts[0]));
    resultParts.push(() => createSpanTag(match, number, unit, measure, options));

    text = parts[1];
    regex.lastIndex = 0;
  }
  return resultParts;
}

function createSpanTag(match, value, unit, measure, options) {
  const [convertTo, convertFrom, withRescaling] = findBaseUnitForActualUnit(unit, options.units);

  if (convertTo === undefined || convertFrom === undefined) {
    return document.createTextNode(match);
  }

  const converted = measure
    .fromUnit(convertFrom)
    .toUnit(convertTo)
    .value(value)
    .rescale(withRescaling)
    .formattedResult();

  const span = document.createElement("span");
  const insertionRenderers = {
    'tooltip': () => {
      span.style.borderBottom = "1px dotted lightgrey";
      span.style.color = "black";
      span.title = converted;
      span.appendChild(document.createTextNode(match));
    },
    'replace': () => {
      span.appendChild(document.createTextNode(converted));
    },
    'brackets': () => {
      span.appendChild(document.createTextNode(`${match} (${converted})`));
    },
    'brackets_strong': () => {
      let strong = document.createElement("strong");
      strong.appendChild(document.createTextNode(`(${converted})`))
      span.appendChild(document.createTextNode(`${match} `));
      span.appendChild(strong);
    },
  };

  let insertMode = Object.keys(insertionRenderers).includes(options.insertionOptions) ? options.insertionOptions : "brackets_strong";
  insertionRenderers[insertMode]();

  return span;
}

function createDivContainer(renderers) {
  const newDiv = document.createElement("div");
  renderers.forEach((e) => newDiv.appendChild(e()));
  return newDiv;
}

// TODO: Maybe I could do it better
function findBaseUnitForActualUnit(actualUnit, units) {
  let au = actualUnit.toUpperCase();
  for (let i = 0; i < units.length; ++i) {
    let k = units[i];
    if (
      au.startsWith(k.actualUnit?.toUpperCase()) ||
      au.startsWith(k.shortFor?.toUpperCase())
    ) {
      return [k.baseUnit, k.actualUnit || k.shortFor, k.rescale === 'on' || k.rescale === true];
    }
  }
  return [undefined, undefined, false];
}

function toNumber(s) {
  const fractionNumber1 = /(?<sign>[+-])?(?<wh>\d+)?\s*(?<fr>[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/gm;
  const fractionNumber2 = /(?<sign>[+-])?(?<wh>\d+)?\s*(?<divisor>\d+)\s*\/\s*(?<divider>\d+)/gm;
  const fractions = {
    '¼': 0.25,
    '½': 0.5,
    '¾': 0.75,
    '⅐': 0.1428,
    '⅑': 0.111,
    '⅒': 0.1,
    '⅓': 0.333,
    '⅔': 0.667,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 0.167,
    '⅚': 0.8333,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875
  };

  s = s.toString().replace(",", "");

  const testFrac1 = fractionNumber1.exec(s);
  if (testFrac1 !== null) {
    const fractionPart = fractions[testFrac1.groups.fr];
    const wholePart = new Number(testFrac1.groups.wh ?? 0);
    const sign = testFrac1.groups.sign === "-" ? -1 : 1;
    return sign * (wholePart + fractionPart);
  }

  const testFrac2 = fractionNumber2.exec(s);
  if (testFrac2 !== null) {
    const fractionDivisor = new Number(testFrac2.groups.divisor);
    const fractionDivider = new Number(testFrac2.groups.divider);
    const wholePart = new Number(testFrac2.groups.wh ?? 0);
    const sign = testFrac2.groups.sign === "-" ? -1 : 1;
    return sign * ((wholePart * fractionDivider + fractionDivisor) / fractionDivider);
  }

  return new Number(s.replace(" ", ""));
}

class Measure {
  constructor(options) {
    this.currentUnit = "";
    this.targetUnit = "";
    this.multiplier = "";
    this.resultMultiplier = "";
    this.resultValue = 0;
    this.setupMeasures(options || []);
  }

  setupMeasures(options) {
    let ct = this.convertingTable || {};
    for (let key in options) {
      addUnit(
        options[key].baseUnit,
        options[key].actualUnit || options[key].shortFor,
        toNumber(options[key].factor),
        toNumber(options[key].offset)
      );
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
    const fail = () => {
      throw new Error(
        `Cannot convert units from '${this.currentUnit}' to '${targetUnit}'`
      );
    };
    const indirectFactor = () => {
      const key = Object.keys(this.convertingTable[this.currentUnit])[0];
      const tempFactor = this.convertingTable[key][targetUnit];
      return (x) =>
        this.convertingTable[this.currentUnit][key](x) * tempFactor(x);
    };

    this.targetUnit = targetUnit;
    this.factor =
      this.convertingTable[this.currentUnit][targetUnit] ||
      indirectFactor() ||
      fail();
    return this;
  }

  fromUnit(sourceUnit) {
    this.currentUnit = sourceUnit;
    return this;
  }

  withMultiplier(multiplierValue) {
    this.multiplier = multiplierValue;
    return this;
  }

  rescale(apply = true) {
    console.log('Apply rescaling:', apply)
    if (!apply) {
      return this;
    }

    // 'coefficient' such value so the constraint '0 < resultValue * coefficient ≤ 1' is true
    // 'coefficient' value should be some power of 10
    let coefficient = Math.pow(10, Math.ceil(Math.log10(this.resultValue)) - 1);
    let m;
    for (let i = 1; i < unitMultipliers.length; ++i) {
      if (coefficient >  unitMultipliers[i - 1].multiplier &&
          coefficient <= unitMultipliers[i    ].multiplier) {
        m = unitMultipliers[i];
        break;
      }
    }
    if (m !== undefined) {
      this.resultValue *= (1 / coefficient);
      this.resultMultiplier = m.quantifiers[0];
    }
    return this;
  }

  value(value) {
    let multiplierValue = 1;
    if (this.multiplier !== undefined) {
      let m = unitMultipliers.find(x => x.quantifiers.includes(this.multiplier.toLowerCase()));
      if (m !== undefined) {
        multiplierValue = m.multiplier;
      }
    }

    value = multiplierValue * toNumber(value);
    this.resultValue = this.currentUnit === this.targetUnit ? value : this.factor(value);
    return this;
  }

  result() {
    return this.resultValue;
  }

  formattedResult(fractionDigits = 2) {
    console.log('Res: ', this.resultValue,
                'Src Unit:', this.currentUnit,
                'Res Mult:', this.resultMultiplier,
                'Trg Unit:', this.targetUnit);
    return `${this.resultValue.toFixed(fractionDigits)} ${this.resultMultiplier}${this.targetUnit}`;
  }
}

function processPage(options) {
  console.log(options);
  options = options || { insertionOptions: 'tooltip', units: [] };
  let measure = new Measure(options.units);
  let regex = constructRegex(options.units);

  deepSearchBodyNodes(document.body, regex, measure, options);
}
