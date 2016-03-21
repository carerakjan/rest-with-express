var multiparty = require('connect-multiparty');
var express = require('express');
var router = express.Router({mergeParams: true});
var config = require('config');
var typeis = require('type-is');
var path = require('path');
var fs = require('fs');

var error = require(config.get('helpers:error'));
var validator = require(config.get('middleware:validator'));

/*hack for validator*/
var transfer = function(req, res, next){
  var keys = req.files ? Object.keys(req.files) : [];

  if(Boolean(keys.length)) {
    req.body.files = [];
    keys.forEach(function(k) {
      var f = req.files[k];
      f = (f instanceof Array) ? f : [f];
      req.body.files = req.body.files.concat(f);
    });
    delete req.files;
  }

  next();
};

var processFindFilesResult = function (file) {
  if(!file) return file;

  var fPath = file.path;
  if(!config.get('uploads:showFullPath')) {
    delete file.path;
  }
  if(config.get('uploads:showActualFileName')) {
    file.actualFileName = path.basename(fPath);
  }
  if(config.get('uploads:showPublicFlag')) {
    file.public = !!~fPath.indexOf('public');
  }
  return file;
};

var dir404 = function(req, res, next) {
  if(!req.params.dir) {
    next();
  } else {
    req.storage('folders').count({_id: req.params.dir}).then(function(count) {
      if(count === 0) {
        next(error.create('Directory Not Found', 404));
      } else {
        next();
      }
    }, next);
  }
};

var storage = require(config.get('middleware:storage'))(config.get('storage'));
var security = require(config.get('middleware:security'))();

router.use(storage.middleware());
router.use(dir404);

router.get('/count', function(req, res, next) {
  var options = {};
  req.params.dir && (options['folderId'] = req.params.dir);
  req.storage('files').count(options).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/', function(req, res, next) {
  var options = {};
  req.params.dir && (options['folderId'] = req.params.dir);
  req.storage('files').find(options).then(function(files) {
    res.json({data: files.map(processFindFilesResult)});
  }, next);
});

router.post('/', security.middleware(), multiparty(config.get('multiparty')), transfer, validator('addFiles').middleware(), function(req, res, next) {
  if (!typeis(req, 'multipart/form-data')) {
    next(new Error('Wrong type of form encoding'));
  } else {
      req.storage('files').insert(req.body.files.map(function(file){
        req.params.dir && (file.folderId = req.params.dir);
        return file;
      })).then(function(files){
        res.json({data: files.map(processFindFilesResult)})
      }, next);
  }

});

router.post('/update', security.middleware(), validator('updateFiles').middleware(), function(req, res, next) {
  var options = [{_id: { $in: req.body.files }}, {$set: {folderId: req.body.folderId}}, {multi: true}];
  req.storage('files').update.apply(req.storage, options).then(function(numUpdated) {
      res.json({data: numUpdated})
  }, next);
});

router.get('/:file', function(req, res, next) {
  var options = {_id: req.params.file};
  req.params.dir && (options['folderId'] = req.params.dir);
  req.storage('files').findOne(options).then(function(file) {
    res.json({data: processFindFilesResult(file)});
  }, next);
});

router.delete('/:file', security.middleware(), function(req, res, next) {
  var options = {_id: req.params.file};
  req.params.dir && (options['folderId'] = req.params.dir);
  req.storage('files').findOne(options).then(function(file){
    if(!file) {
      next(error.create('File Not Found', 404));
    } else {
      req.storage('files').remove(options).then(function(numRemoved) {
        if(numRemoved) {
          fs.unlink(file.path, function(err) {
            err ? next(err) : res.json({data: numRemoved});
          });
        }
      }, next);
    }
  }, next);
});

router.get('/:file/download', security.middleware(), function(req, res, next){
  var options = {_id: req.params.file};
  req.params.dir && (options['folderId'] = req.params.dir);
  req.storage('files').findOne(options).then(function(file) {
    if(!file) {
      next(error.create('File Not Found', 404));
    } else {
      res.download(file.path, file.name, function(err){
        err && next(err);
      });
    }
  }, next);
});

module.exports = router;