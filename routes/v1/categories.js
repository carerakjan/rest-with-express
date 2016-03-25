var config = require('config');
var express = require('express');
var router = express.Router({mergeParams: true});
var dbName = 'categories';

var validator = require(config.get('middleware:validator'));

var storage = require(config.get('middleware:storage'))(config.get('storage'));
var security = require(config.get('middleware:security'))();
var error = require(config.get('helpers:error'));

/* Middlewares. */
router.use(storage.middleware());

/* API. */
router.get('/count', function(req, res, next) {
  req.storage(dbName).count({}).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/types', function(req, res, next) {
  res.json({data: config.get('category:types')});
});

router.get('/', function(req, res, next) {
  req.storage(dbName).find({}).then(function(categories) {
    res.json({data: categories});
  }, next);
});

router.get('/:cat', function(req, res, next) {
  req.storage(dbName).findOne({_id: req.params['cat']}).then(function(category) {
    res.json({data: category});
  }, next);
});

router.post('/:cat/items', security.middleware(), validator('stringItems').middleware(), function(req, res, next) {
  var options = [{_id: req.params['cat']}, {$addToSet:{items:{$each:req.body}}}];
  req.storage(dbName).update.apply(req.storage, options).then(function(numUpdated) {
    res.json({data: numUpdated});
  }, next);
});

router.delete('/:cat/items', security.middleware(), validator('stringItems').middleware(), function(req, res, next) {
  var options = [{_id: req.params['cat']}, {$pull:{items:{$in:req.body}}}];
  req.storage(dbName).update.apply(req.storage, options).then(function(numUpdated) {
    res.json({data: numUpdated});
  }, next);
});

router.delete('/:cat', security.middleware(), function(req, res, next) {
  req.storage(dbName).remove({_id: req.params['cat']}).then(function(numRemoved) {
    res.json({data: numRemoved});
  }, next);
});

router.post('/', security.middleware(), validator('categories').middleware(), function(req, res, next) {
  req.body.items = req.body.items || [];
  req.storage(dbName).insert(req.body).then(function(docs) {
    res.json({data: docs});
  }, next);
});

module.exports = router;