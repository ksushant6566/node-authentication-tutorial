const express = require('express')
const bodyParser = require('body-parser')
const userRouter = express.Router()
const User = require('../models/User')

userRouter.use(bodyParser.json());

userRouter.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username})
        .then(user => {
            if(user !== null) {
                var err = new Error(`User ${req.body.username} already exists !`);
                err.status = 401;
                next(err);
            }
            else {
                User.create({
                    username: req.body.username,
                    password: req.body.password
                }).then(user => {
                    res.status(200).json({
                        status: 'registration successfull',
                        user: user
                    })
                }).catch(err => next(err));
            }
        })
        
        })


userRouter.post('/login', (req, res, next) => {

    if(!req.session.user) {
        var authHeader = req.headers.authorization;

        if(!authHeader) {
            console.log("yaha par hua kand");
            const err = new Error('you are not authenticated');
            err.status = 401;
            res.setHeader('WWW-Authenticate', 'Basic');
            return next(err);
        }
        
        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];

        User.findOne({username: username})
            .then(user => {
                if(user === null) {
                    const err = new Error('User ' + username + 'does not exist!');
                    err.status = 403;
                    return next(err);
                }
                else if (user.password !== password ) {
                    const err = new Error('Invalid Password !');
                    err.status = 403;
                    return next(err);
                }
                else {
                    req.session.user = 'authenticated';
                    res.status(200).json("you are authenticated");
                }
            }).catch(err => next(err));
    }
    else {
        res.status(200).json("you are already authenticated !");
    }
})

userRouter.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy();
        req.clearCookie('session-id');
        res.redirect('/');
    }else {
        const err = new Error('You are not logged in !');
        err.status = 403;
        next(err);
    }
});

module.exports = userRouter;