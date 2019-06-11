const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(
    user,
    config.secretKey,
    {
      expiresIn: 3600,
    }
  );
};

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey,
};

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      console.log("JWT payload: ", jwt_payload);
      User.findOne(
        { _id: jwt_payload._id }, 
        (err, user) => {
          if (err) {
            return done(
              err,
              false
            );
          } else if (user) {
            return done(
              null,
              user
            );
          } else {
            return done(
              null,
              false
            );
          }
        }
      )
    }
  )
);

exports.verifyUser = passport.authenticate('jwt', { session: false });

// verifyAdmin expects verifyUser to be called first
exports.verifyAdmin = function(req, res, next) {
  if (req.user.admin) {
    return next();
  }

  const err = new Error('You are not authorized to perform this operation!');
  err.status = 403;
  return next(err);    
};

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne(
        { facebookId: profile.id },
        (err, user) => {
          if (err) {
            return done(err, false);
          }
          if (!err && user !== null) {
            return done(null, user);
          }
          user = new User( { username: profile.displayName } );
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.familyName;
          user.save((err, user) => {
            if (err) {
              return done(err, false);
            }
            return done(null, user);
          });
        }
      );
    }
  )
);