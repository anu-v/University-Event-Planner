var express =require('express');
var app = express();
var path = require('path');

var session = require('express-session');
var cookieparser = require('cookie-parser');

app.use(cookieparser());
app.use(session({
    secret: 'Ektara',  proxy: false, resave: false, saveUninitialized: false
}));
var viewPath = path.join(__dirname, './views');
var connectionDB= require('./model/connectionDB')
app.set('view engine', 'ejs');
app.set('views', viewPath);

app.use('/assets', express.static('assests'));
app.use('/assets/css',express.static(path.join(__dirname,'/./assets/css')));
app.use('/assets/images',express.static(path.join(__dirname,'/./assets/images')));
app.use('/partials',express.static('partials'));

var profilecontroller = require('./controller/ProfileController.js');
app.use('/',profilecontroller);
app.use('/connections',profilecontroller);
app.use('/connection',profilecontroller);
app.use('/about',profilecontroller);
app.use('/contact',profilecontroller);
app.use('/newConnection',profilecontroller);
app.use('/savedConnections',profilecontroller);
app.use('/*', profilecontroller);



app.listen(8083);
console.log('started at port 8083');
module.exports = app;
