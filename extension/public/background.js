/*global chrome*/

chrome.runtime.onInstalled.addListener(() => {
  console.log('EasyMeasure extension successfully installed!');
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery != 'processPage') {
    sendResponse(false);
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, ([tab]) => {
    if (tab === undefined) {
      console.error('Active tab was not obtained.');
      sendResponse(false);
      return;
    }

    console.log(`Executing script in the tab: ${tab.id}`);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
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
              addUnit(options[key].baseUnit, options[key].actualUnit || options[key].shortFor, toNumber(options[key].factor), toNumber(options[key].offset));
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
        
          value(value) {
            value = toNumber(value);
            let result = this.currentUnit === this.targetUnit ? value : this.factor(value);
            return result;
          }
        }

        const defaultOptions = [ {
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
          "factor": 200,
          "offset": 0
        }, {
          "baseUnit": "ml",
          "shortFor": "tablespoon",
          "plural": true,
          "factor": 12,
          "offset": 0
        }, {
          "baseUnit": "ml",
          "shortFor": "teaspoon",
          "plural": true,
          "factor": 2.5,
          "offset": 0
        } ];

        chrome.storage.sync.get(['options'], processLoadedPage);

        function processLoadedPage(result) {
          options = result.options || defaultOptions;
          let measure = new Measure(options);
          let regex = constructRegex();
          deepSearchBodyNodes(document.body, regex);

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
              //options[key].baseUnit && pushUnit(options[key].baseUnit);
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
            if (node.nodeName.toUpperCase() === "SCRIPT") {
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
        
              const match = m[0].slice(0, m[0].length);
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
            // console.log(number, size, multiplier, unit, convertFrom, convertTo);
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

          function findBaseUnitForActualUnit(actualUnit) {
            let au = actualUnit.toUpperCase();
            for (let i = 0; i < options.length; ++i) {
              let k = options[i];
              if (au.startsWith(k.actualUnit?.toUpperCase()) || au.startsWith(k.shortFor?.toUpperCase())) {
                return [ k.baseUnit, k.actualUnit || k.shortFor ];
              }
            }
            return [ undefined, undefined ];
          }

          function convert(value, from, to, multiplier = undefined, fractionDigits = 2) {
            let res = measure.fromUnit(from).toUnit(to).value(value).toFixed(fractionDigits);
            //console.log(`Converting value ${value} from '${from}' to '${to}' is equal to ${res}`);
            return res;
          }
        }
      }
    });

    sendResponse(true);
  });
});