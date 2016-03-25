var express = require('express');
var router = express.Router({mergeParams: true});
var config = require('config');
var path = require('path');
var dbName = 'uploads';

var error = require(config.get('helpers:error'));
var validator = require(config.get('middleware:validator'));
var optimizer = require(config.get('middleware:optimizer'));

var storage = require(config.get('middleware:storage'))(config.get('storage'));
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

var getOptimizationHandlers = function(size, multi) {

  var primarily = [security.middleware()];
  var secondary = [function(req, res, next) {
    var options = {_id: {$in: multi ? req.body : [req.params.image]}, type: {$in: config.get('image:mime')}};
    req.storage(dbName).find(options).then(function(images) {
      req.body.files = images;
      next();
    }, next);
  }, optimizer(size).middleware(), function(req, res){
    var numMinified = req.body.files.length;
    res.json({data: numMinified});
  }];

  if(multi) {
    primarily.push(validator('stringItems').middleware());
  }

  return primarily.concat(secondary);
};

router.use(storage.middleware());

router.get('/count', function(req, res, next) {
  var options = {type: {$in: config.get('image:mime')}};
  req.storage(dbName).count(options).then(function(count) {
    res.json({data: count});
  }, next);
});

router.patch('/small', getOptimizationHandlers('small', true));
router.patch('/large', getOptimizationHandlers('large', true));
router.patch('/huge', getOptimizationHandlers('huge', true));

router.get('/', function(req, res, next) {
  var options = {type: {$in: config.get('image:mime')}};
  req.storage(dbName).find(options).then(function(images) {
    res.json({data: images.map(processFindFilesResult)});
  }, next);
});

router.get('/:image', function(req, res, next) {
  var options = {_id: req.params.image, type: {$in: config.get('image:mime')}};
  req.storage(dbName).find(options).then(function(images) {
    res.json({data: images.map(processFindFilesResult)});
  }, next);
});

router.patch('/:image/small', getOptimizationHandlers('small'));
router.patch('/:image/large', getOptimizationHandlers('large'));
router.patch('/:image/huge', getOptimizationHandlers('huge'));


module.exports = router;