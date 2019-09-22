const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    posts: [
      {
        postId: {
          type: Schema.Types.ObjectId,
          ref: 'Post'
        },
        post: {
          type: String
        },
        createdAt: {
          type: Date,
          default: Date.now()
        }
      }
    ]
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
