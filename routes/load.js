var multiparty = require('connect-multiparty');
var express = require('express');
var router = express.Router();
var config = require('config');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('load', {scripts:[
    {src: 'https://code.jquery.com/jquery-2.2.1.min.js'},
    {src: 'javascripts/upload.js'}
  ]});
});

router.post('/', multiparty({uploadDir: path.join(config.get('common:rootPath'), config.get('multiparty:options:uploadDir'))}), function(req, res, next) {

});

module.exports = router;
