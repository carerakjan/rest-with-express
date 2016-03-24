function getApi(version) {

  var apiPathKey = 'v' + version;

  var express = require('express');
  var router = express.Router();

  var users = require('./' + apiPathKey + '/users');
  var uploads = require('./' + apiPathKey + '/uploads');
  var categories = require('./' + apiPathKey + '/categories');
  var authenticate = require('./' + apiPathKey + '/authenticate');

  /* GET users listing. */
  router.use('/' + apiPathKey + '/users', users);
  router.use('/' + apiPathKey + '/uploads', uploads);
  router.use('/' + apiPathKey + '/categories', categories);
  router.use('/' + apiPathKey + '/authenticate', authenticate);

  return router
}

module.exports = getApi;
