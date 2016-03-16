var appRoot = require('app-root-path');
var nconf = require('nconf');
var path = require('path');

nconf.argv().env().file({ file: path.join(__dirname, 'config.json') });

nconf.set('common:rootPath', appRoot.toString());
nconf.set('storage:location', path.join(nconf.get('common:rootPath'), nconf.get('storage:options:location')));
nconf.set('multiparty:options:uploadDir', path.join(nconf.get('common:rootPath'), nconf.get('multiparty:options:uploadDir')));
nconf.set('common:middleware', path.join(nconf.get('common:rootPath'), nconf.get('common:middleware')));
nconf.set('superuser:middleware', path.join(nconf.get('common:middleware'), nconf.get('superuser:middleware')));
nconf.set('storage:middleware', path.join(nconf.get('common:middleware'), nconf.get('storage:middleware')));
nconf.set('validator:middleware', path.join(nconf.get('common:middleware'), nconf.get('validator:middleware')));
nconf.set('security:middleware', path.join(nconf.get('common:middleware'), nconf.get('security:middleware')));

module.exports = nconf;