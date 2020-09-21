const express = require('express');
const morgan = require('morgan');
const http = require('http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const  FileStore = require('session-file-store')(session);

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected correctly to server", db);
}, (err) => { console.log(err); });

const app = express();
app.use(morgan('dev'));


function auth (req, res, next) {
    
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');              
        err.status = 401;
        next(err);
        return;
    }
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    if (user == 'admin' && pass == 'password') {
        // res.signedCookie('user','admin',{signed: true});
        req.session.user = 'admin';
        next(); // authorized
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');              
        err.status = 401;
        next(err);
    }
}
    else {
        if (req.session.user === 'admin') {
            next();
        }
        else {
            var err = new Error('You are not authenticated!');
            err.status = 401;
            next(err);
        }
    }
}


// app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
    name: 'pehla session',
    secret: 'super secret',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}))

app.use(auth);

app.use('/dishes', require('./routes/dishRouter'));
app.use('/promotions', require('./routes/promoRouter'));
app.use('/leaders', require('./routes/leaderRouter'));

const port = 3000;
const host = "localhost";

const server = http.createServer(app);

server.listen(port, host, () => {
    console.log("server is running on port");
})











