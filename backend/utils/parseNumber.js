var pegjs = require('pegjs');
var fs = require('fs');

// var grammar = fs.readFileSync('./utils/grammar.pegjs');
// var numberParser = pegjs.generate(grammar);

module.exports = {
  parseNumber: (s) => parseFloat(s) // numberParser.parse(s)
};