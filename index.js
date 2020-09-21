const express = require('express');
const morgan = require('morgan');
const http = require('http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const  FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, ({useNewUrlParser: true, useUnifiedTopology: true }));

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

const app = express();
app.use(morgan('dev'));



app.use(cookieParser('super secret'));
app.use(session({
    name: 'session-id',
    secret: 'super secret',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}))
// app.use(authenticate);;
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/indexRouter'));


function auth (req, res, next) {
    console.log(req.session);
    console.log(req.user);
    
    if (!req.user) {
        const err = new Error('You are not authenticated');
        err.status = 403;
        return next(err);
    }
    else {
        next();
    }
}

app.use('/users', require('./routes/userRouter'));
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











