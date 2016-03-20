var path = require('path');
var config = require('config');
var express = require('express');
var router = express.Router();
var scrambler = require(config.get('lib:scrambler'))();
var dbName = 'users';

var validator = require(config.get('middleware:validator'))({schema:{
    type: 'object',
    properties: {
        login: { type:'string' },
        password: { type: 'string'}
    },
    required: ['login', 'password']
}, options:{
    removeAdditional: true
}});

var storage = require(config.get('middleware:storage'))(config.get('storage'));

var security = require(config.get('middleware:security'));

    /* Middlewares. */
router.use(storage.middleware());
router.use(security.middleware());

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

router.get('/:id', function(req, res, next) {
    req.storage(dbName).findOne({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.delete('/:id', function(req, res, next) {
    req.storage(dbName).remove({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.put('/:id', validator.middleware(), function(req, res, next) {
    req.storage(dbName).update({_id: req.params.id}, {$set: req.body}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.post('/', validator.middleware(), function(req, res, next) {

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