const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const User = require('../models/user');
const authenticate = require('../authenticate');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(
    new User(
      {
        username: req.body.username,
      }
    ),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});      
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(
            {
              status: 'Registration Successful!',
              success: true,
            }
          );        
        });
      }
    }
  );
});

router.post(
  '/login',
  passport.authenticate('local'),
  (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(
      {
        status: 'You are successfully logged in!',
        success: true,
        token: token,
      }
    );        
  }
);

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    return next(err);
  }
});

module.exports = router;
