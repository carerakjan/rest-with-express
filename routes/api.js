function getApi(version) {

  var apiPathKey = 'v' + version;

  var express = require('express');
  var router = express.Router();

  var users = require('./' + apiPathKey + '/users');
  //var files = require('./' + apiPathKey + '/files');
  //var contents = require('./' + apiPathKey + '/contents');

  /* GET users listing. */
  router.use('/', users);
  router.use('/' + apiPathKey, users);
  router.use('/' + apiPathKey + '/users', users);
  //router.use('/' + apiPathKey + '/files', files);
  //router.use('/' + apiPathKey + '/contents', contents);

  return router
}

module.exports = getApi;
