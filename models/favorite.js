const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        required: true,  
      },
    ],
  },
  {
    timestamps: true,
  },
);

var Favorites = mongoose.model(
  'Favorite',
  favoriteSchema,
);

module.exports = Favorites;