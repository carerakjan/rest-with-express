var config = require('config');
var error = require(config.get('helpers:error'));

module.exports = function(message) {
    return function(req, res, next) {
        next(error.create(message, 404));
    }
};