var config = require('config');
var express = require('express');
var router = express.Router({mergeParams: true});
var files = require('./files');
var dbName = 'folders';

var validator = require(config.get('validator:middleware'))({schema:{
  type: 'object',
  properties: {
    name: { type:'string' }
  },
  required: ['name']
}, options: config.get('validator:options')});

var storage = require(config.get('storage:middleware'))(config.get('storage:options'));
var security = require(config.get('security:middleware'))();

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
  req.storage(dbName).remove({_id: req.params.dir}).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.post('/', security.middleware(), validator.middleware(), function(req, res, next) {
  req.storage(dbName).insert(req.body).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.use('/:dir/files', files);

module.exports = router;