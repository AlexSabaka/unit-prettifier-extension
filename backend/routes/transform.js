var express = require('express');
//var processPage = require('../utils/pageProcessor');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  //TODO: add validations
  const { content, options } = req.body;
  console.log(options);
  console.log(content);
  res.send(req.body); // processPage(content, options));
});

module.exports = router;
