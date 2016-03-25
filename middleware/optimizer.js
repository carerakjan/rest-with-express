var path = require('path');
var config = require('config');
var ImageEditor = require(config.get('lib:imageditor'));

function Optimizer(tasksKey) {
    this._tasksKey = tasksKey;
    this._tasks = config.get('image:' + tasksKey);
}

Optimizer.prototype._process = function(next) {
    var self = this;
    return function _(images) {
        if(!images.length) {
            return next();
        }

        var first = images.shift(),
            _name = path.basename(first.path),
            _path = path.join(config.get('public:thumbnails'), self._tasksKey + "_" + _name),
            cb = function() {
                if(!images.length) {
                    return next();
                }
                _(images);
            };

        new ImageEditor(self._tasks)
            .addTasks({name: 'write', args: [_path, cb]})
            .process(first.path)
            .catch(next);
    };
};

Optimizer.prototype._middleware = function(req, res, next) {
    if(!req.body.files) {
        next();
    } else {
        this._process(next)(req.body.files.filter(function(file){
            return ImageEditor.isImage(file.type);
        }));
    }
};

Optimizer.prototype.middleware = function() {
    return this._middleware.bind(this);
};

module.exports = function(tasksKey) {
    return new Optimizer(tasksKey);
};