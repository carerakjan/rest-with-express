var config = require('config');
var express = require('express');
var router = express.Router({mergeParams: true});
var dbName = 'messages';

var validator = require(config.get('middleware:validator'));
var emptyuser = require(config.get('middleware:emptyuser'))();
var security = require(config.get('middleware:security'))();

/* Middlewares. */
router.use(emptyuser.middleware());

/* API. */
router.get('/count', function(req, res, next) {
    req.storage(dbName).count({recipient: req.params['userId']}).then(function(count) {
        res.json({data: count});
    }, next);
});

router.get('/new_help', function(req, res) {
    var schema = validator().getSchema('newMessage');
    res.json({data: schema});
});

router.get('/edit_help', function(req, res) {
    var schema = validator().getSchema('editMessage');
    res.json({data: schema});
});

router.get('/', function(req, res, next) {
    req.storage(dbName).find({recipient: req.params['userId']}).then(function(messages) {
        res.json({data: messages});
    }, next);
});

router.get('/:messageId', function(req, res, next) {
    req.storage(dbName).findOne({_id: req.params['messageId'], recipient: req.params['userId']}).then(function(message) {
        res.json({data: message});
    }, next);
});

router.put('/:messageId', security.middleware(), validator('editMessage').middleware(), function(req, res, next) {
    var options = [{_id: req.params['messageId'], recipient: req.params['userId']}, {$set: req.body}];
    req.storage(dbName).update.apply(options).then(function(numRemoved) {
        res.json({data: numRemoved});
    }, next);
});

router.delete('/:messageId', security.middleware(), function(req, res, next) {
    req.storage(dbName).remove({_id: req.params['messageId'], recipient: req.params['userId']}).then(function(numRemoved) {
        res.json({data: numRemoved});
    }, next);
});

router.post('/', security.middleware(), validator('newMessage').middleware(), function(req, res, next) {
    req.body.recipient = req.params['userId'];
    req.body.message = encodeURI(req.body.message);
    req.body.status = "NEW";
    req.storage(dbName).insert(req.body).then(function(docs) {
        res.json({data: docs});
    }, next);
});

module.exports = router;