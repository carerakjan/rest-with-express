var express = require('express');
var router = express.Router({mergeParams: true});
var config = require('config');
var path = require('path');
var dbName = 'uploads';

var error = require(config.get('helpers:error'));
var validator = require(config.get('middleware:validator'));
var optimizer = require(config.get('middleware:optimizer'));

var emptyuser = require(config.get('middleware:emptyuser'))();
var security = require(config.get('middleware:security'))();

var processFindFilesResult = function (file) {
  if(!file) return file;

  if(!config.get('uploads:showFullPath')) {
    file.path = path.basename(file.path);
  }
  if(!config.get('uploads:showAuthor')) {
    delete file.author;
  }
  return file;
};

var getOptimizationHandlers = function(multi) {

  return [
    security.middleware(),
    validator(multi ? 'optimizeImages' : 'optimizeOneImage').middleware(),
    function(req, res, next) {
      var options = {
        _id: {$in: multi ? req.body['ids'] : [req.params.image]},
        creator: req.params['userId'],
        type: {$in: config.get('image:mime')}
      };
      req.storage(dbName).find(options).then(function(images) {
        req.body.files = images;
        optimizer(req.body['taskName']).middleware()(req, res, next);
      }, next);
    },
    function(req, res){
      var numMinified = req.body.files.length;
      res.json({data: numMinified});
    }
  ];

};

router.use(emptyuser.middleware());

router.get('/count', function(req, res, next) {
  var options = {creator: req.params['userId'], type: {$in: config.get('image:mime')}};
  req.storage(dbName).count(options).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/optimize_help', function(req, res) {
  var schema = validator().getSchema('optimizeImages');
  res.json({data: schema});
});

router.post('/optimize', getOptimizationHandlers(true));

router.get('/', function(req, res, next) {
  var options = {creator: req.params['userId'], type: {$in: config.get('image:mime')}};
  req.storage(dbName).find(options).then(function(images) {
    res.json({data: images.map(processFindFilesResult)});
  }, next);
});

router.get('/:image', function(req, res, next) {
  var options = {_id: req.params.image, creator: req.params['userId'], type: {$in: config.get('image:mime')}};
  req.storage(dbName).findOne(options).then(function(image) {
    res.json({data: processFindFilesResult(image)});
  }, next);
});

router.get('/:image/optimize_help', function(req, res) {
  var schema = validator().getSchema('optimizeOneImage');
  res.json({data: schema});
});

router.post('/:image/optimize', getOptimizationHandlers());

module.exports = router;