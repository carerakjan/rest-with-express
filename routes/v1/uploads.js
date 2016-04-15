var multiparty = require('connect-multiparty');
var express = require('express');
var router = express.Router({mergeParams: true});
var config = require('config');
var typeis = require('type-is');
var path = require('path');
var fs = require('fs');
var dbName = 'uploads';

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

  if(!config.get('uploads:showFullPath')) {
    file.path = path.basename(file.path);
  }
  if(!config.get('uploads:showAuthor')) {
    delete file.creator;
  }
  return file;
};

var emptyuser = require(config.get('middleware:emptyuser'))();
var security = require(config.get('middleware:security'))();

router.use(emptyuser.middleware());

router.get('/count', function(req, res, next) {
  var options = {creator: req.params['userId']};
  req.storage(dbName).count(options).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/', function(req, res, next) {
  var options = {creator: req.params['userId']};
  req.storage(dbName).find(options).then(function(files) {
    res.json({data: files.map(processFindFilesResult)});
  }, next);
});

router.post('/', security.middleware(), multiparty(config.get('multiparty')), transfer, validator('addFiles').middleware(), function(req, res, next) {
    req.storage(dbName).insert(req.body.files.map(function(file){
      file.creator = req.params['userId'];
      return file;
    })).then(function(files){
      res.json({data: files.map(processFindFilesResult)})
    }, next);
});

router.get('/:file', function(req, res, next) {
  var options = {_id: req.params.file, creator: req.params['userId']};
  req.storage(dbName).findOne(options).then(function(file) {
    res.json({data: processFindFilesResult(file)});
  }, next);
});

router.delete('/:file', security.middleware(), function(req, res, next) {
  var options = {_id: req.params.file, creator: req.params['userId']};
  req.storage(dbName).findOne(options).then(function(file){
    if(!file) {
      next(error.create('File Not Found', 404));
    } else {
      req.storage(dbName).remove(options).then(function(numRemoved) {
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
  var options = {_id: req.params.file, creator: req.params['userId']};
  req.storage(dbName).findOne(options).then(function(file) {
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