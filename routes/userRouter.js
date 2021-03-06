const express = require('express')
const bodyParser = require('body-parser')
const userRouter = express.Router()
const User = require('../models/User')
const passport = require('passport')
const authenticate = require('../authenticate');
const cors = require('./cors');
const { Router } = require('express')


userRouter.use(bodyParser.json());

userRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    User.find()
        .then(users => res.status(200).json(users))
        .catch(err => res.status(400).json(err))
})

userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {

    User.register(new User({username : req.body.username}), 
        req.body.password )
        .then(user => {

            if(req.body.firstname) 
                user.firstname = req.body.firstname;
            if(req.body.lastname)
                user.lastname = req.body.lastname;
                
            user.save((err, user) => {
                if(err) {
                    res.status(500).json({err: err})
                    return;
                }
                passport.authenticate('local')(req, res, () => {
                    res.status(200).json({
                        success: true, 
                        status: "Registration successful!"
                    });
                });
            })
        })
        .catch(err => {
            res.status(500).json({err: err});
        })

})

userRouter.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    
    const token = authenticate.getToken({_id: req.user._id})
    res.status(200).json({
        success: true, 
        status: "You are successfully logged In!",
        token: token
    });
})

userRouter.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }else {
        const err = new Error('You are not logged in !');
        err.status = 403;
        next(err);
    }
});

userRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if(req.user) {
        const token = authenticate.getToken({ _id: req.user._id });
        res.status(200).json({
            success: true, 
            token,
            status: "You are successfully logged in!"
        });
    }
})

module.exports = userRouter;