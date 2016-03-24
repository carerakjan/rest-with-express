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

router.put('/:cat', security.middleware(), validator('updateCategory').middleware(), function(req, res, next) {
  var add = req.body.add;
  var del = req.body.delete;

  if(!add || !add.length || !del || !del.length) {
    res.json({data: 0});
  } else {
    var update = {};
    add && (update['$push'] = {items:{$each:add}});
    del && (update['$pull'] = {items:{$in:del}});
    req.storage(dbName).update({_id: req.params['cat']}, update).then(function(numUpdated) {
      res.json({data: numUpdated});
    }, next);
  }

});

router.delete('/:cat', security.middleware(), function(req, res, next) {
  req.storage(dbName).remove({_id: req.params['cat']}).then(function(numRemoved) {
    res.json({data: numRemoved});
  }, next);
});

router.post('/', security.middleware(), validator('categories').middleware(), function(req, res, next) {
  req.storage(dbName).insert(req.body).then(function(docs) {
    res.json({data: docs});
  }, next);
});

module.exports = router;