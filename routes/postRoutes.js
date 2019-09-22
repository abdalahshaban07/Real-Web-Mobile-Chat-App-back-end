const express = require('express');
const router = express.Router();
const {
  addPost,
  getAllPosts,
  addLike,
  addComment,
  getPost
} = require('../controllers/post');
const { VerifyToken } = require('../Helpers/AuthHelper');

router.get('/posts', VerifyToken, getAllPosts);
router.get('/post/:id', VerifyToken, getPost);

router.post('/post/add-post', VerifyToken, addPost);
router.post('/post/add-like', VerifyToken, addLike);
router.post('/post/add-comment', VerifyToken, addComment);

module.exports = router;
