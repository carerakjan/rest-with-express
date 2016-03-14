var path = require('path');
var config = require('config');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var scrambler = require('../../lib/scrambler')();

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

/* API. */
router.post('/', validator.middleware(), storage.middleware(), function(req, res, next) {
    // find the user
    req.storage('users').findOne({
        login: req.body.login
    }).then(function(user) {

        if (!user) {
            next(new Error('Authentication failed. User not found.'));
        } else if (user) {

            // check if password matches
            scrambler.verify({
                secret: req.body.password,
                salt: config.get('scrambler.salt'),
                iterations: config.get('scrambler.iterations'),
                keylen: config.get('scrambler.keylen'),
                key: user.password
            }).then(function(isMatch) {
                if (!isMatch) {
                    next(new Error('Authentication failed. Wrong password.'));
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, config.get('tokenSalt') + req.headers['user-agent'], {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({token: token});
                }
            }, next);
        }
    }, next);
});

module.exports = router;