var db = require('nedb-active-record');

function Storage(params) {
    /*config reset*/
    db.config({});

    params &&
    params !== null &&
    typeof params === 'object' &&
    db.config(params);
}

Storage.prototype._middleware = function (req, res, next) {
    req.storage = function(name) {
        return new db(name);
    }.bind(this);
    next();
};

Storage.prototype.middleware = function() {
    return this._middleware.bind(this);
};

module.exports = function(params) {
    return new Storage(params);
};