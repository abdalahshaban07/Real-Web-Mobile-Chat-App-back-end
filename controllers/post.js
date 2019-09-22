const postCtrl = {};
const Joi = require('joi');
const HttpStatues = require('http-status-codes');
const Post = require('../models/postModels');
const User = require('../models/userModels');

postCtrl.addPost = async (req, res) => {
  const schema = Joi.object().keys({
    post: Joi.string().required()
  });
  const { error, value } = Joi.validate(req.body, schema);
  if (error && error.details) {
    return res.status(HttpStatues.BAD_REQUEST).json({ msg: error.details });
  }

  const body = {
    user: req.user._id,
    username: req.user.username,
    post: value.post,
    createdAt: new Date()
  };
  Post.create(body)
    .then(async post => {
      await User.updateOne(
        { _id: req.user._id },
        {
          $push: {
            posts: {
              postId: post._id,
              post: req.body.post || post.post || value,
              createdAt: new Date()
            }
          }
        }
      );
      return res.status(HttpStatues.OK).json({ message: 'Post Created', post });
    })
    .catch(err => {
      return res
        .status(HttpStatues.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
};

postCtrl.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(HttpStatues.OK).json({ message: 'All Posts', posts });
  } catch (err) {
    return res
      .status(HttpStatues.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error Occured' });
  }
};

postCtrl.addLike = async (req, res) => {
  const postId = req.body._id;
  await Post.updateOne(
    { _id: postId, 'likes.username': { $ne: req.user.username } },
    {
      $push: {
        likes: {
          username: req.user.username
        }
      },
      $inc: { totalLikes: 1 }
    }
  )
    .then(() => {
      return res.status(HttpStatues.OK).json({ message: 'You Liked The post' });
    })
    .catch(err => {
      return res
        .status(HttpStatues.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
};

postCtrl.addComment = async (req, res) => {
  console.log(req.body);
  const postId = req.body.postId;
  await Post.updateOne(
    { _id: postId },
    {
      $push: {
        comments: {
          userId: req.user._id,
          username: req.user.username,
          comment: req.body.comment,
          createdAt: new Date()
        }
      }
    }
  )
    .then(() => {
      return res
        .status(HttpStatues.OK)
        .json({ message: 'You commented The post' });
    })
    .catch(err => {
      return res
        .status(HttpStatues.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
};

postCtrl.getPost = async (req, res) => {
  await Post.findOne({ _id: req.params.id })
    .populate('user')
    .populate('comments.userId')
    .then(post => {
      return res.status(HttpStatues.OK).json({ message: 'Post Found', post });
    })
    .catch(err => {
      return res
        .status(HttpStatues.NOT_FOUND)
        .json({ message: 'Post Not Found', post });
    });
};

module.exports = postCtrl;
