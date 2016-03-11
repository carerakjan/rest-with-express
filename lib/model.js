function Model(router) {
    router && (this._router = router);
}

Model.prototype.getApi = function() {
  return [
      {method: 'post', path: '/'},
      {method: 'put', path: '/'},
      {method: 'get', path: '/'},
      {method: 'get', path: '/:id/exists'},
      {method: 'head', path: '/:id'},
      {method: 'get', path: '/:id'},
      {method: 'delete', path: '/:id'},
      {method: 'put', path: '/:id'},
      {method: 'get', path: '/findOne'},
      {method: 'post', path: '/update'},
      {method: 'get', path: '/count'}
  ]
};

module.exports = function() {
    return new Model();
};