var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var config = require('config');

/*custom middlewares*/
var e404 = require(config.get('middleware:404'));

/* routes */
var home = require(config.get('routes:index'));
var api = require(config.get('routes:api'))(config.get('common:apiVersion'));

/* app settings */
var app = express();
app.set('views', config.get('structure:views'));
app.set('view engine', config.get('express:viewEngine'));
app.set('env', config.get('common:env'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

//app.use(require('node-sass-middleware')({
//  src: path.join(__dirname, 'public'),
//  dest: path.join(__dirname, 'public'),
//  indentedSyntax: true,
//  sourceMap: true
//}));

app.use(express.static(config.get('structure:public')));
app.use('/', home);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(e404('Not Found'));

app.use(function(err, req, res, next) {

  err.code &&
  err.code === 'ENOENT' &&
  !config.get('common:isDev') &&
  (err.message = err.message.split(',')[0]);

  var response = {
    error: {
      status: err.status,
      message: err.message,
      details: err.details
    }
  };

  config.get('common:isDev') &&
  (response.error.stack = err.stack.split('\n'));

  res.status(err.status || 500).json(response);

});

module.exports = app;
