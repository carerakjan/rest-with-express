var express = require('express');
var router = express.Router();

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
    name:'users',
    options: {
        timestampData: true,
        autoload: true
    }});

/* Middlewares. */
router.use(validator.middleware());
router.use(storage.middleware());

/* API. */
router.get('/', function(req, res, next) {
    req.storage.read().then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.get('/:id', function(req, res, next) {
    req.storage.readOne(req.params.id).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.delete('/:id', function(req, res, next) {
    req.storage.deleteOne(req.params.id).then(function(docs) {
        res.json({data: docs});
    }, next);
});

router.post('/', function(req, res, next) {
   req.storage.create(req.body).then(function(docs) {
       res.json({data: docs});
   }, next);
});

router.get('/count', function(req, res, next) {
    req.storage.count().then(function(count) {
        res.json({data: count});
    }, next);
});

module.exports = router;