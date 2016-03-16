var appRootPath = require('app-root-path');
var rootPath = appRootPath.toString();
var nconf = require('nconf');
var path = require('path');

nconf.argv().env().file({ file: path.join(rootPath, 'config', 'config.json') });

nconf.set('common:rootPath', rootPath);

nconf.set('structure', nconf.get('structure').reduce(function(obj, item){
    obj[item] = path.join(nconf.get('common:rootPath'), item);
    return obj;
}, {}));

nconf.set('middleware', nconf.get('middleware').reduce(function(obj, item){
    obj[item] = path.join(nconf.get('structure:middleware'), item);
    return obj;
}, {}));

nconf.set('routes', nconf.get('routes').reduce(function(obj, item){
    obj[item] = path.join(nconf.get('structure:routes'), item);
    return obj;
}, {}));

nconf.set('lib', nconf.get('lib').reduce(function(obj, item){
    obj[item] = path.join(nconf.get('structure:lib'), item);
    return obj;
}, {}));

nconf.set('storage:location', nconf.get('structure:database'));
nconf.set('multiparty:uploadDir', nconf.get('structure:uploads'));

module.exports = nconf;