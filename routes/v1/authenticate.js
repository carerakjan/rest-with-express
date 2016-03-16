var path = require('path');
var config = require('config');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var scrambler = require('../../lib/scrambler')();

var generateToken = function(user, req, res, next) {

    var conf = config.get('scrambler');
    conf.secret = req.body.password;
    conf.key = user.password;

    scrambler.verify(conf).then(function(isMatch) {
        if (!isMatch) {
            next(new Error('Authentication failed. Wrong password.'));
        } else {
            // if user is found and password is right
            // create a token
            var token = jwt.sign(user,
                config.get('jwt:secret') + req.headers['user-agent'],
                config.get('jwt:options:sign'));

            // return the information including token as JSON
            res.json({token: token});
        }
    }, next);

};

var superuser = require(config.get('superuser:middleware'))();

var validator = require(config.get('validator:middleware'))({schema:{
    type: 'object',
    properties: {
        login: { type:'string' },
        password: { type: 'string' },
        isRoot: { type: 'boolean' }
     },
    required: ['login', 'password']
}, options:{
    removeAdditional: true
}});

var storage = require(config.get('storage:middleware'))(config.get('storage:options'));

/* API. */
router.post('/', validator.middleware(), superuser.middleware(), storage.middleware(), function(req, res, next) {

    if(req.superuser) {
        generateToken(req.superuser, req, res, next);
    } else {
        // find the user
        req.storage('users').findOne({
            login: req.body.login
        }).then(function(user) {
            if (!user) {
                next(new Error('Authentication failed. User not found.'));
            } else {
                generateToken(user, req, res, next);
            }
        }, next);
    }

});

module.exports = router;