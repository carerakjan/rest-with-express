var path = require('path');
var express = require('express');
var router = express.Router();
var dbName = path.basename(__filename).split('.')[0];

//TODO: uncomment after upgrade node.js to v5.8
//var dbName = path.parse(__filename).name;

var validator = require('../../middleware/validator')({schema:{
    type: 'object',
    properties: {
        name: { type:'string' },
        age: { type: 'string'}
    },
    required: ['name', 'age']
}, options:{
    removeAdditional: true
}});

var storage = require('../../middleware/storage')({
    timestampData: true,
    autoload: true
});

/* Middlewares. */
router.use(validator.middleware());
router.use(storage.middleware());

/* API. */
router.get('/count', function(req, res, next) {
    req.storage(dbName).count({}).then(function(count) {
        res.json({data: count});
    }, next);
});

router.get('/', function(req, res, next) {
    req.storage(dbName).find({}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.get('/:id', function(req, res, next) {
    req.storage(dbName).findOne({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.delete('/:id', function(req, res, next) {
    req.storage(dbName).remove({_id: req.params.id}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.post('/', function(req, res, next) {
   req.storage(dbName).insert(req.body).then(function(docs) {
       res.json({data: docs});
   }, next);
});

module.exports = router;