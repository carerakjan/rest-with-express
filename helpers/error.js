module.exports = {
    create: function(message, statusCode) {
        var error = new Error(message);
        statusCode && (error.status = statusCode);
        return error;
    }
};