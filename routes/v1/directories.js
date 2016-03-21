var config = require('config');
var express = require('express');
var router = express.Router({mergeParams: true});
var files = require('./files');
var dbName = 'folders';

var validator = require(config.get('middleware:validator'))('folders');

var storage = require(config.get('middleware:storage'))(config.get('storage'));
var security = require(config.get('middleware:security'))();

/* Middlewares. */
router.use(storage.middleware());

/* API. */
router.get('/count', function(req, res, next) {
  req.storage(dbName).count({}).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/', function(req, res, next) {
  req.storage(dbName).find({}).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.get('/:dir', function(req, res, next) {
  req.storage(dbName).findOne({_id: req.params.dir}).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.delete('/:dir', security.middleware(), function(req, res, next) {
  req.storage(dbName).remove({_id: req.params.dir}).then(function(numRemoved) {
    res.json({data: numRemoved});
  }, next);
});

router.post('/', security.middleware(), validator.middleware(), function(req, res, next) {
  req.storage(dbName).insert(req.body).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.use('/:dir/files', files);

module.exports = router;