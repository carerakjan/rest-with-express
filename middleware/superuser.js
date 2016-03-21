var config = require('config');
var error = require(config.get('helpers:error'));

var _middleware = function(req, res, next) {
    if(req.body.isRoot === true) {
        var user = config.get('superuser');
        if(user && req.body.login === user.login) {
            req.superuser = user;
            next();
        } else {
            next(error.create('Authentication failed. User not found.', 401));
        }
    } else {
        next();
    }
};

module.exports = function() {
  return {
      middleware: function() {
          return _middleware
      }
  };
};