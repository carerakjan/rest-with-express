var path = require('path');
var config = require('config');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var scrambler = require('../../lib/scrambler')();
var dbName = path.basename(__filename).split('.')[0];

//TODO: uncomment after upgrade node.js to v5.8
//var dbName = path.parse(__filename).name;

var validator = require('../../middleware/validator')({schema:{
    type: 'object',
    properties: {
        login: { type:'string' },
        password: { type: 'string'}
    },
    required: ['login', 'password']
}, options:{
    removeAdditional: true
}});

var storage = require('../../middleware/storage')({
    timestampData: true,
    autoload: true
});

var security = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.get('tokenSalt') + req.headers['user-agent'], function (err, decoded) {
            if (err) {
                next(new Error('Failed to authenticate token.'));
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        var error = new Error('No token provided.');
        error.status = 403;
        next(error);
    }
};

    /* Middlewares. */
router.use(storage.middleware());

/* API. */
router.get('/count', function(req, res, next) {
    req.storage(dbName).count({}).then(function(count) {
        res.json({data: count});
    }, next);
});

router.get('/', security, function(req, res, next) {
    req.storage(dbName).find({}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.get('/:id', security, function(req, res, next) {
    req.storage(dbName).findOne({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.delete('/:id', security, function(req, res, next) {
    req.storage(dbName).remove({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.post('/', security, validator.middleware(), function(req, res, next) {

    scrambler.encode({
        secret: req.body.password,
        salt: config.get('scrambler.salt'),
        iterations: config.get('scrambler.iterations'),
        keylen: config.get('scrambler.keylen')
    }).then(function(key){
        req.body.password = key.toString('hex');
        req.storage(dbName).insert(req.body).then(function(docs) {
            res.json({data: docs});
        }, next);
    }, next);

});

module.exports = router;