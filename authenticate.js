const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');
const Dishes = require('./models/Dishes');
const FacebookTokenStrategy = require('passport-facebook-token');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : config.secretKey
};

exports.jwtPassport = passport.use(new jwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT PAYLOAD: ", jwt_payload);
        User.findOne({_id: jwt_payload._id})
            .then(user => {
                if(user) {
                    return done(null, user);
                }else {
                    return done(null, false);
                }
            })
            .catch(err => {
                return done(err, false);
            })
    }))

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin === false) {
        const err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }else {
        next();
    }
}

exports.verifyAuthor = (req, res, next) => {
    Dishes.findById(req.params.dishId)
        .then(dish => {
            if(dish != null && dish.comments.id(req.params.commentId) != null) {
                if(dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
                    next();
                }else {
                    const err = new Error("You are not authorized to perform this operation!");
                    err.status = 403;
                    return next(err);
                }
            }else {
                next();
            }
        })
        .catch(err => next(err));
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id})
        .then(user => {
            if(user !== null) {
                return done(null, user);
            }else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                
                user.save()
                    .then(user => {
                        return done(null, user);
                    })
                    .catch(err => {
                        return done(err, null);
                    })
            }
                
        })
        .catch(err => {return done(err, null)})
}))