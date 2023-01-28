var express = require('express');
var processPage = require('../utils/processPage.js');
var router = express.Router();

router.options('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  //TODO: add validations
  let { content, options } = req.body;
  var resultPageBody = processPage(content, options);

  //res.header("Content-Type", "text/html");
  res.send(resultPageBody);
});

module.exports = router;
