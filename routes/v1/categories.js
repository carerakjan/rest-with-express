var config = require('config');
var express = require('express');
var router = express.Router({mergeParams: true});
var dbName = 'categories';

var validator = require(config.get('middleware:validator'));
var emptyuser = require(config.get('middleware:emptyuser'))();
var security = require(config.get('middleware:security'))();
var error = require(config.get('helpers:error'));

/* Middlewares. */
router.use(emptyuser.middleware());

/* API. */
router.get('/count', function(req, res, next) {
  req.storage(dbName).count({creator: req.params['userId']}).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/new_help', function(req, res) {
  var schema = validator().getSchema('categories');
  res.json({data: schema});
});

router.get('/', function(req, res, next) {
  req.storage(dbName).find({creator: req.params['userId']}).then(function(categories) {
    res.json({data: categories});
  }, next);
});

router.get('/:cat', function(req, res, next) {
  req.storage(dbName).findOne({_id: req.params['cat'], creator: req.params['userId']}).then(function(category) {
    res.json({data: category});
  }, next);
});

router.get('/:cat/items_help', function(req, res) {
  var schema = validator().getSchema('uniqueStringItems');
  res.json({data: schema});
});

router.post('/:cat/items', security.middleware(), validator('uniqueStringItems').middleware(), function(req, res, next) {
  var options = [{_id: req.params['cat'], creator: req.params['userId']}, {$addToSet:{items:{$each:req.body}}}];
  req.storage(dbName).update.apply(req.storage, options).then(function(numUpdated) {
    res.json({data: numUpdated});
  }, next);
});

router.delete('/:cat/items', security.middleware(), validator('uniqueStringItems').middleware(), function(req, res, next) {
  var options = [{_id: req.params['cat'], creator: req.params['userId']}, {$pull:{items:{$in:req.body}}}];
  req.storage(dbName).update.apply(req.storage, options).then(function(numUpdated) {
    res.json({data: numUpdated});
  }, next);
});

router.delete('/:cat', security.middleware(), function(req, res, next) {
  req.storage(dbName).remove({_id: req.params['cat'], creator: req.params['userId']}).then(function(numRemoved) {
    res.json({data: numRemoved});
  }, next);
});

router.post('/', security.middleware(), validator('categories').middleware(), function(req, res, next) {
  req.body.items = req.body.items || [];
  req.body.creator = req.params['userId'];
  req.storage(dbName).insert(req.body).then(function(docs) {
    res.json({data: docs});
  }, next);
});

module.exports = router;