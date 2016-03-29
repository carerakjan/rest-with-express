var path = require('path');
var config = require('config');
var express = require('express');
var router = express.Router();
var scrambler = require(config.get('lib:scrambler'))();
var dbName = 'users';

var validator = require(config.get('middleware:validator'));

var storage = require(config.get('middleware:storage'))(config.get('storage'));

var security = require(config.get('middleware:security'))();

    /* Middlewares. */
router.use(storage.middleware());

/* API. */
router.get('/new_help', function(req, res) {
    var schema = validator().getSchema('newUser');
    res.json({data: schema});
});

router.get('/edit_help', function(req, res) {
    var schema = validator().getSchema('editUser');
    res.json({data: schema});
});

router.get('/forgot_help', function(req, res) {
    var schema = validator().getSchema('forgotPassword');
    res.json({data: schema});
});

router.get('/count', security.middleware(), function(req, res, next) {
    req.storage(dbName).count({}).then(function(count) {
        res.json({data: count});
    }, next);
});

router.get('/', security.middleware(), function(req, res, next) {
    req.storage(dbName).find({}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.get('/:id', security.middleware(), function(req, res, next) {
    req.storage(dbName).findOne({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.delete('/:id', security.middleware(), function(req, res, next) {
    req.storage(dbName).remove({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.put('/:id', security.middleware(), validator('editUser').middleware(), function(req, res, next) {
    req.storage(dbName).update({_id: req.params.id}, {$set: req.body}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.post('/', security.middleware(), validator('newUser').middleware(), function(req, res, next) {

    var conf = config.get('scrambler');
    conf.secret = req.body.password;

    scrambler.encode(conf).then(function(key){
        req.body.password = key.toString('hex');
        req.storage(dbName).insert(req.body).then(function(docs) {
            res.json({data: docs});
        }, next);
    }, next);

});

module.exports = router;