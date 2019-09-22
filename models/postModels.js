const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      default: ''
    },
    post: {
      type: String,
      default: ''
    },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        username: {
          type: String,
          default: ''
        },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now() }
      }
    ],
    totalLikes: {
      type: Number,
      default: 0
    },
    likes: [
      {
        username: { type: String, default: '' }
      }
    ],
    createdAt: { type: Date, default: Date.now() }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
