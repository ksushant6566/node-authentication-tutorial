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

// 20b42e3ea0f0c1f43959cd5d92d19707

// 3661984343819780