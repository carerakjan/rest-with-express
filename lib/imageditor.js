var Jimp = require("jimp");

function ImageEditor(tasks) {
    this._tasks = tasks ? JSON.parse(JSON.stringify(tasks)) : [];
}

ImageEditor.Jimp = Jimp;

ImageEditor.isPng = function(mime) {
    return Jimp.MIME_PNG === mime;
};

ImageEditor.isJpeg = function(mime) {
    return Jimp.MIME_JPEG === mime;
};

ImageEditor.isBmp = function(mime) {
    return Jimp.MIME_BMP === mime;
};

ImageEditor.isImage = function(mime) {
    return  ImageEditor.isBmp(mime) ||
            ImageEditor.isJpeg(mime) ||
            ImageEditor.isPng(mime);
};

ImageEditor.prototype.addTasks = function(tasks) {
    if(tasks) {
        if(tasks instanceof Array) {
            this._tasks = this._tasks.concat(tasks);
        } else {
            this._tasks.push(tasks);
        }
    }

    return this;
};

ImageEditor.prototype.process = function(file) {
    return Jimp.read(file).then(function(image) {
        return this._tasks.reduce(function(image, method) {
            var args = method.args instanceof Array
                ? method.args
                : (method.args !== null ? [method.args] : []);

            args.reduce(function(args, item, index){
                if(typeof item === 'string' && item in Jimp) {
                    args[index] = Jimp[item];
                }
                return args;
            }, args);
            return image[method.name].apply(image, args);
        }, image);
    }.bind(this));
};

module.exports = ImageEditor;