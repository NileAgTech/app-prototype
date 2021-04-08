var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var https = require('https');
var http = require('http');
var fs = require('fs');

var app = express();

// path to security certs

var options = {
  key: fs.readFileSync('/etc/ssl/private/private.key'),
  cert: fs.readFileSync('/etc/ssl/certificate.crt')
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).send('file not found');
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// setup https server
var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

httpServer.listen(8080);
httpsServer.listen(443);

//app.listen(3000);
console.log('listening on port 8080 AND https on 443');
