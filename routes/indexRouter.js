const express = require('express');
const IndexRouter = express.Router();


IndexRouter.all('/', (req, res, next) => {
    res.json("welcome to Express! ");
    // next();
})

module.exports = IndexRouter;