var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var appRoot = require('app-root-path');
var helmet = require('helmet');
var config = require('config');

var restApiVersion = 1;
var load = require('./routes/load');
var home = require('./routes/index');
var api = require('./routes/api')(restApiVersion);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//env setup
app.set('env', config.get('common:env'));

config.overrides({'common:rootPath': appRoot.toString()});

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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/api', api);
app.use('/upload', load);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {

  var response = {
    error: {
      status: err.status,
      message: err.message,
      details: err.details
    }
  };

  (app.get('env') === 'development') &&
  (response.error.stack = err.stack.split('\n'));

  res.status(err.status || 500).json(response);

});

module.exports = app;
