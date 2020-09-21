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

app.use('/loda', (req, res) => {
    res.json("Welcome home");
})

// app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
    name: 'session-id',
    secret: 'super secret',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}))
app.use('/users', require('./routes/userRouter'));

function auth (req, res, next) {
    console.log(req.session);

    if (!req.session.user || req.session.user !== 'authenticated') {
        const err = new Error('You are not authenticated');
        err.status = 403;
        return next(err);
    }
    else if(req.session.user === 'authenticated') {
        next();
    }
}

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











