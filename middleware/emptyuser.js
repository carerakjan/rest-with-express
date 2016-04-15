var config = require('config');
var error = require(config.get('helpers:error'));

var _middleware = function(req, res, next) {
    var options = {_id: req.params['userId']};
    req.storage('users').count(options).then(function(count) {
       if(!count) {
           next(error.create('User not found.', 401));
       } else {
           next();
       }

    });
};

module.exports = function() {
    return {
        middleware: function() {
            return _middleware
        }
    };
};