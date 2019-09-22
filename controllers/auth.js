const authCtrl = {};
const User = require('../models/userModels');
const Joi = require('joi');
const HttpStatues = require('http-status-codes');
const Helper = require('../Helpers/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secert');

authCtrl.createUser = async (req, res) => {
  // console.log(req.body);
  const schema = Joi.object().keys({
    username: Joi.string()
      .min(5)
      .max(10)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]/)
      .required()
      .min(5)
  });
  const { error, value } = Joi.validate(req.body, schema);

  if (error && error.details) {
    return res.status(HttpStatues.BAD_REQUEST).json({ msg: error.details });
  }
  const userEmail = await User.findOne({
    email: Helper.lowerCase(value.email)
  });
  if (userEmail) {
    return res
      .status(HttpStatues.CONFLICT)
      .json({ message: 'Email already exist' });
  }

  const userName = await User.findOne({
    username: Helper.firstUpper(value.username)
  });
  if (userName) {
    return res
      .status(HttpStatues.CONFLICT)
      .json({ message: 'User Name already exist' });
  }

  return bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(value.password, salt, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatues.BAD_REQUEST)
          .json({ message: 'Error Hasin Password' });
      }
      const body = {
        username: Helper.firstUpper(value.username),
        email: Helper.lowerCase(value.email),
        password: hash
      };
      User.create(body)
        .then(user => {
          const token = jwt.sign({ user }, dbConfig.secret, {
            expiresIn: '1h'
          });
          res.cookie('auth', token);
          return res
            .status(HttpStatues.CREATED)
            .json({ message: 'User Create Successfully', user, token });
        })
        .catch(err => {
          return res
            .status(HttpStatues.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error in created ' });
        });
    });
  });
};

authCtrl.loginUser = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res
      .status(HttpStatues.INTERNAL_SERVER_ERROR)
      .json({ message: 'No empty fields allowed' });
  }
  await User.findOne({ username: Helper.firstUpper(req.body.username) })
    .then(user => {
      if (!user) {
        return res
          .status(HttpStatues.NOT_FOUND)
          .json({ message: 'User Name Not found' });
      }
      return bcrypt.compare(req.body.password, user.password).then(result => {
        if (!result) {
          return res
            .status(HttpStatues.INTERNAL_SERVER_ERROR)
            .json({ message: 'Password is not correct' });
        }
        const token = jwt.sign({ data: user }, dbConfig.secret, {
          expiresIn: '1h'
        });
        res.cookie('auth', token);
        return res
          .status(HttpStatues.OK)
          .json({ message: ' Login Success', user, token });
      });
    })
    .catch(err => {
      return res
        .status(HttpStatues.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
};

module.exports = authCtrl;
