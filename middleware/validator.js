var env = require('jjv')();

function Validator(params) {

    this._options = null;
    this._respond = true;

    params.schema &&
    (this._schema = params.schema);

    params.options &&
    (this._options = params.options);

    ('respond' in params) &&
    (this._respond = params['respond']);
}

Validator.prototype._middleware = function (req, res, next) {
    var errors = env.validate(this._schema, req.body, this._options);
    if(errors && this._respond) {
        var error = new Error('Validation Error');
        error.details = errors;
        next(error);
    } else if(errors) {
        req.bodyValidationErrors = errors;
        next();
    } else {
        next();
    }
};

Validator.prototype.middleware = function() {
    return this._middleware.bind(this);
};

module.exports = function(params) {
  return new Validator(params);
};