var config = require('config');

var _middleware = function(req, res, next) {
    if(req.body.isRoot === true) {
        var user = config.get('superuser');
        if(user && req.body.login === user.login) {
            req.superuser = user;
            next();
        } else {
            next(new Error('Authentication failed. User not found.'));
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