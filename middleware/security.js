var config = require('config');
var error = require(config.get('helpers:error'));
var jwt = require('jsonwebtoken');

function _middleware(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.get('jwt:secret') + req.headers['user-agent'], function (err, decoded) {
            if (err) {
                next(error.create('Failed to authenticate token.', 403));
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        next(error.create('No token provided.', 403));
    }
};

module.exports = function() {
    return {
        middleware: function() {
            return _middleware
        }
    };
};