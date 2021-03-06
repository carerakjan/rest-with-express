function getApi(version) {

  var apiPathKey = 'v' + version;

  var express = require('express');
  var router = express.Router();

  var users = require('./' + apiPathKey + '/users');
  var authenticate = require('./' + apiPathKey + '/authenticate');

  /* GET users listing. */
  router.use('/' + apiPathKey + '/users', users);
  router.use('/' + apiPathKey + '/authenticate', authenticate);

  return router
}

module.exports = getApi;
