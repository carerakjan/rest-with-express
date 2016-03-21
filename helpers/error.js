module.exports = {
    create: function(message, statusCode, additionalOptions) {
        var error = new Error(message);
        statusCode && (error.status = statusCode);
        additionalOptions && Object.keys(additionalOptions).forEach(function(key) {
            error[key] = additionalOptions[key];
        });
        return error;
    }
};