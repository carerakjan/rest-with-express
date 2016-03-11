var db = require('nedb-active-record');

function Storage(params) {
    /*config reset*/
    db.config({});

    params.options &&
    db.config(params.options);

    params.name &&
    (this._name = params.name);
}

Storage.prototype.create = function(docs) {
    return new (new db(this._name))(docs).save();
};

Storage.prototype.read = function() {
    return new db(this._name).find({});
};

Storage.prototype.readOne = function(id) {
    return new db(this._name).findOne({_id: id});
};

Storage.prototype.deleteOne = function(id) {
    return new db(this._name).remove({_id: id});
};

Storage.prototype.count = function() {
    return new db(this._name).count({});
};

Storage.prototype._middleware = function (req, res, next) {
    req.storage = this;
    next();
};

Storage.prototype.middleware = function() {
    return this._middleware.bind(this);
};

module.exports = function(params) {
    return new Storage(params);
};