var express = require('express');
var processPage = require('../utils/processPage.js');
var router = express.Router();

const defaultOptions = [ {
  "baseUnit": "g",
  "actualUnit": "lb",
  "shortFor": "pound",
  "plural": true,
  "factor": 0.0023148148148148147,
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

router.get('/:userId/options', function (req, res) {
  res.json(defaultOptions);
});

router.options('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

/* POST Html source for analyzing. */
router.post('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Content-Type", "text/html");

  let { url, options } = req.body;
  processPage(url, defaultOptions)
    .then(page => res.send(page))
    .catch((err) => res.json({ statusCode: 500, message: err }));
});

module.exports = router;
