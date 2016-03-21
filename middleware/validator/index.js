var schemas = require('./schemas');
var config = require('config');
var error = require(config.get('helpers:error'));
var env = require('jjv')();

env.defaultOptions = config.get('validator');

Object.keys(schemas).forEach(function(key) {
    env.addSchema(key, schemas[key]);
});

function Validator(schema) {
    this._schema = schema;
}

Validator.prototype._middleware = function (req, res, next) {
    var errors = this._schema ? env.validate(this._schema, req.body) : null;
    next(errors ? error.create('Validation Error', 422, {details: errors}) : null);
};

Validator.prototype.middleware = function() {
    return this._middleware.bind(this);
};

module.exports = function(schema) {
  return new Validator(schema);
};