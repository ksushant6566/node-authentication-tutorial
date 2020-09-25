const express = require('express');
const cors = require('cors');
const app = express();

const whiteList = ['http://localhost:3000'];

const corsOptionDelegate = (req, cb) => {
    var corsOptions =  whiteList.indexOf(req.header('Origin')) !== -1 ? { origin: true} : { origin: false};
    cb(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionDelegate);

