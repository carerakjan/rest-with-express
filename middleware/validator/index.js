var schemas = require('./schemas');
var config = require('config');
var error = require(config.get('helpers:error'));
var env = require('jjv')();

Object.keys(config.get('validator')).forEach(function(key) {
    env.defaultOptions[key] = config.get('validator')[key];
});

Object.keys(schemas).forEach(function(key) {
    env.addSchema(key, schemas[key]);
});

function Validator(schema) {
    this._schema = schema;
}

Validator.prototype.getSchema = function(schemaName) {
    return JSON.parse(JSON.stringify(schemas[schemaName]));
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