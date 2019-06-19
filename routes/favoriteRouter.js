const bodyParser = require('body-parser');
const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

// This function is re-used below
const addToFavorites = (req, res, next) => {
  // req.body is [{"_id":"dish ObjectId"}, . . ., {"_id":"dish ObjectId"}]
  let dishesToAdd = req.body.map((entry) => entry['_id']).filter((id) => id); // remove bad entries
  dishesToAdd = [...new Set(dishesToAdd)]; // remove duplicates
  if (dishesToAdd.length) {
    Favorites.find({ user: req.user._id })
    .then((favorites) => {
      if (favorites.length) {
        // Entry exists for user, so add to it
        const favorite = favorites[0]; // If multiple entries exist per user just take the first one for now.
        const existingDishIds = favorite.dishes.map((object) => object._id.toString());
        const newDishesToAdd = dishesToAdd.filter((id) => !existingDishIds.includes(id));
        if (newDishesToAdd.length) {
          favorite.dishes = existingDishIds.concat(newDishesToAdd);
          favorite.save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
          }, (err) => next(err));
        } else {
          // No new dishes, just return the existing favorite entry
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        }
      } else {
        // No entry exists for user, create one
        newFavorite = {
          user: req.user._id,
          dishes: dishesToAdd,
        };
        Favorites.create(newFavorite)
        .then((favorite) => {
          Favorites.findById(favorite._id)
          .populate('user')
          .populate('dishes')
          .then((favorite) => {
            console.log('Favorite Created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);  
          })
        }, (err) => next(err))
        .catch((err) => next(err));
      }
    }, (err) => next(err))
    .catch((err) => next(err));
  } else {

  }
};

favoriteRouter.route('/')
.options(
  cors.corsWithOptions,
  (req, res) => {
    res.sendStatus(200);
  }
)
.get(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
  }
)
.post(
  cors.corsWithOptions,
  authenticate.verifyUser,
  addToFavorites,
)
.put(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  }
)
.delete(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.remove({ user: req.user._id })
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  }
);

favoriteRouter.route('/:dishId')
.options(
  cors.corsWithOptions,
  (req, res) => {
    res.sendStatus(200);
  }
)
.get(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (_req, res, _next) => {
    Favorites.findOne({ user: req.user._id})
    .then((favorites) => {
      const exists = favorites && (favorites.dishes.indexOf(req.params.dishId) >= 0);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json(
        { 
          "exists": exists,
          "favorites": favorites,
        }
      );    
    }, (err) => next(err))
    .catch((err) => next(err))
  }
)
.post(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    req.body = [
      {
        "_id": req.params.dishId,
      }
    ]
    addToFavorites(req, res, next);
  }
)
.put(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
  }
)
.delete(
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .then((favorites) => {
      if (favorites.length) {
        // Entry exists for user, so remove dishId from it
        const favorite = favorites[0]; // If multiple entries exist per user just take the first one for now.
        const existingDishIds = favorite.dishes.map((object) => object._id.toString());
        if (existingDishIds.includes(req.params.dishId)) {
          favorite.dishes = existingDishIds.filter((id) => id != req.params.dishId);
          favorite.save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
          }, (err) => next(err));  
        } else {
          // If nothing to delete just return the entry
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        }
      } else {
        // If no entry for user, just return ok
        res.sendStatus(200);
      }
    }, (err) => next(err))
    .catch((err) => next(err));  
  }
);

module.exports = favoriteRouter;