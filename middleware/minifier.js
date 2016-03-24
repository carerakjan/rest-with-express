var path = require('path');
var config = require('config');
var ImageEditor = require(config.get('lib:imageditor'));
var minifyTasks = config.get('image:small');

var minify = function(next) {
    return function _(images) {
        if(!images.length) {
            return next();
        }

        var first = images.shift(),
            _name = path.basename(first.path),
            _path = path.join(config.get('public:thumbnails'), _name),
            cb = function() {
                if(!images.length) {
                    return next();
                }
                _(images);
            };

        new ImageEditor(minifyTasks)
            .addTasks({name: 'write', args: [_path, cb]})
            .process(first.path)
            .catch(next);
    };
};

var _middleware = function(req, res, next) {
    if(!req.body.files) {
        next();
    } else {
        minify(next)(req.body.files.filter(function(file){
            return ImageEditor.isImage(file.type);
        }));
    }
};

module.exports = function() {
    return {
        middleware: function() {
            return _middleware
        }
    };
};