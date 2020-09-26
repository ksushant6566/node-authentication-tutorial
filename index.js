const express = require('express');
const morgan = require('morgan');
const http = require('http');
const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
// const  FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');
const path = require('path');

const url = config.mongoUrl;
const connect = mongoose.connect(url, ({useNewUrlParser: true, useUnifiedTopology: true }));

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

const app = express();
app.use(morgan('dev'));

// app.use(cookieParser('super secret'));
app.use(passport.initialize());

app.use('/', require('./routes/indexRouter'));
app.use('/users', require('./routes/userRouter'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', require('./routes/dishRouter'));
app.use('/promotions', require('./routes/promoRouter'));
app.use('/leaders', require('./routes/leaderRouter'));
app.use('/imageUpload', require('./routes/uploadRouter'));
app.use('/favorites', require('./routes/favoriteRouter'));

const port = 3000;
const host = "localhost";

const server = http.createServer(app);

server.listen(port, host, () => {
    console.log("server is running on port");
})











