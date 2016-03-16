module.exports = function(message) {
    return function(req, res, next) {
        var err = new Error(message);
        err.status = 404;
        next(err);
    }
};