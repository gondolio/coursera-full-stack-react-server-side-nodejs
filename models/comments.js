const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

var Comments = mongoose.model(
  'Comment',
  commentSchema,
);

module.exports = Comments;