var express = require('express');
var jsdom = require('jsdom');
var processPage = require('../utils/pageProcessor');
var router = express.Router();

const { JSDOM } = jsdom; 

/* GET users listing. */
router.post('/', function(req, res, next) {
  const dom = new JSDOM(req.body.content);
  const options = req.body.options; // TODO: validate
  res.send(processPage(dom.document, options));
});

module.exports = router;
