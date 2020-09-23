const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

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