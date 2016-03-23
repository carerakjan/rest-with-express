var Jimp = require("jimp");

function ImageEditor(options) {
    this._options = options;
}

ImageEditor.prototype.isPng = function(mime) {
    return Jimp.MIME_PNG === mime;
};

ImageEditor.prototype.isJpeg = function(mime) {
    return Jimp.MIME_JPEG === mime;
};

ImageEditor.prototype.isBmp = function(mime) {
    return Jimp.MIME_BMP === mime;
};

ImageEditor.prototype.isImage = function(mime) {
    return this.isBmp(mime) || this.isJpeg(mime) || this.isPng(mime);
};

ImageEditor.prototype.process = function(file) {
    return Jimp.read(file).then(function(image) {
        return this._options.reduce(function(image, method) {
            return image[method.name].apply(image, method.args);
        }, image);
    }.bind(this));
};

module.exports = function(options) {
  return new ImageEditor(options);
};