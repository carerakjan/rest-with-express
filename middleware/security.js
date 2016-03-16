var config = require('config');
var jwt = require('jsonwebtoken');

function _middleware(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.get('jwt:secret') + req.headers['user-agent'], function (err, decoded) {
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

module.exports = function() {
    return {
        middleware: function() {
            return _middleware
        }
    };
};