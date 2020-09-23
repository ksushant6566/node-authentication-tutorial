const express = require('express')
const bodyParser = require('body-parser')
const userRouter = express.Router()
const User = require('../models/User')
const passport = require('passport')
const authenticate = require('../authenticate');

userRouter.use(bodyParser.json());


userRouter.post('/signup', (req, res, next) => {

    User.register(new User({username : req.body.username}), req.body.password )
        .then(user => {
            passport.authenticate('local')(req, res, () => {
                res.status(200).json({success: true, status: "Registration successful!"});
            });
        })
        .catch(err => {
            res.status(500).json({err: err});
        })

})

userRouter.post('/login', passport.authenticate('local'), (req, res) => {
    
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

module.exports = userRouter;