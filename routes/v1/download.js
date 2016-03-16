
var file404 = function(req, res, next) {
    req.storage('files').count({_id:req.params.file}).then(function(count) {
        if(count === 0) {
            var err = new Error('File Not Found');
            err.status = 404;
            next(err);
        } else {
            next();
        }
    }, next);
};

router.get('/:file', file404, function(req, res, next) {
    req.storage('files').findOne({folderId:req.params.dir, _id: req.params.file}).then(function(docs) {
        res.json({data: docs});
    }, next);
});

//router.delete('/:file', file404, security.middleware(), function(req, res, next) {
//  req.storage('files').remove({_id: req.params.id}).then(function(docs) {
//    res.json({data: docs});
//  }, next);
//});

router.get('/:file/download', file404, function(req, res, next){
    req.storage('files').findOne({folderId:req.params.dir, _id: req.params.file}).then(function(file) {
        if(!file) {
            var err = new Error('File Not Found');
            err.status = 404;
            next(err);
        } else {
            res.download(file.path, file.name, function(err){
                err && next(err);
            });
        }
    }, next);
});