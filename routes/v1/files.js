var multiparty = require('connect-multiparty');
var express = require('express');
var router = express.Router({mergeParams: true});
var config = require('config');
var typeis = require('type-is');

var validator = require(config.get('validator:middleware'))({schema:{
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties:{
          name: {type:'string'},
          path: {type:'string'},
          size: {type:'number'},
          type: {type:'string'}
        },
        required: ['name', 'path', 'size', 'type']
      }
    }
  },
  required: ['files']
}, options:{
  removeAdditional: true
}});

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

var dir404 = function(req, res, next) {
  req.storage('folders').count({_id:req.params.dir}).then(function(count) {
    if(count === 0) {
      var err = new Error('Directory Not Found');
      err.status = 404;
      next(err);
    } else {
      next();
    }
  }, next);
};

var storage = require(config.get('storage:middleware'))(config.get('storage:config'));
var security = require(config.get('security:middleware'))();

router.use(storage.middleware());

router.get('/count', dir404, function(req, res, next) {
  req.storage('files').count({folderId:req.params.dir}).then(function(count) {
    res.json({data: count});
  }, next);
});

router.get('/', dir404, function(req, res, next) {
  req.storage('files').find({folderId:req.params.dir}).then(function(docs) {
    res.json({data: docs});
  }, next);
});

router.post('/', security.middleware(), dir404, multiparty(config.get('multiparty:options')), transfer, validator.middleware(), function(req, res, next) {
  if (!typeis(req, 'multipart/form-data')) {
    next(new Error('Wrong type of form encoding'));
  } else {
      req.storage('files').insert(req.body.files.map(function(file){
        file.folderId = req.params.dir;
        return file;
      })).then(function(files){
        res.json({data:files})
      }, next);
  }

});

module.exports = router;
