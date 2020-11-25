const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const Post = require('../models/Post');

exports.getAllUsers = function (req, res) {
  User.find({}).then((users) => {
    if (!users) {
      res.json('Failed to retrieve all users');
    }
    res.status(200).json(users); //successfully got all users
  });
};

//It should get their posts as well as their bio info
exports.getUser = function (req, res) {
  User.findById(req.params.id)
    .populate('posts')
    .populate('friends')
    .populate({
      path: 'friendRequests',
      populate: {
        path: 'fromUser',
        model: 'User',
        select: 'firstName lastName profilePicture',
      },
    })
    .populate({
      path: 'friendRequests',
      populate: {
        path: 'toUser',
        model: 'User',
        select: 'firstName lastName profilePicture',
      },
    })
    .then((user) => {
      if (!user) {
        res.json({ error: 'User does not exist' });
        return;
      }
      res.status(200).json(user); //successfully retrieve user
    });
};

// GET ALL POSTS FROM ONE USER
exports.getUserPosts = function (req, res, next) {
  Post.find({ user: { $eq: req.params.id } })
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        model: 'User',
        select: 'firstName lastName profilePicture',
      },
    })
    .populate('user', 'firstName lastName profilePicture')
    .populate({
      path: 'reactions',
      populate: { path: 'user', model: 'User', select: 'firstName lastName' },
    })
    .sort({ _id: -1 })
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      next(err);
    });
};

exports.createUser = [
  body('password')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Must enter password'),
  body('firstName')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Must enter first name'),
  body('lastName')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Must enter last name'),
  body('email').isEmail().normalizeEmail(),
  body('gender')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Please enter a gender'),

  (req, res, next) => {
    const errors = validationResult(req);
    //handle errors
    if (!errors.isEmpty()) {
      res.status(400).json(errors.errors);
      return;
    }
    //checks if an email is already in use
    User.findOne({ email: req.body.email })
      .then((document) => {
        if (document) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          // if err, do something
          if (err) {
            return next(err);
          }
          //only information when user first signs up
          const newUser = new User({
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            gender: req.body.gender,
            joinDate: moment().format('MMMM Do[,] YYYY'),
            birthday: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year,
            },
          });
          newUser
            .save()
            .then((newUser) => {
              res.json({ message: 'Account successfully created' });
            })
            .catch((err) => {
              return next(err);
            });
        });
      })
      .catch((err) => {
        return next(err);
      });
  },
];

//need to be able to uplaod pictures
exports.updateUser = [
  body('firstName')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Must enter first name'),
  body('lastName')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Must enter last name'),
  body('bio').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    //handle errors
    if (!errors.isEmpty()) {
      res.status(400).json(errors.errors);
      return;
    }
    const updatedUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
      profilePicture: req.body.profilePicture,
      coverPicture: req.body.coverPicture,
    };
    User.findByIdAndUpdate(req.params.id, updatedUser, { new: true })
      .then((updated) => {
        res.status(200).json({ message: 'User info updated', updated });
      })
      .catch((err) => {
        return next(err);
      });
  },
];

exports.logIn = [
  body('email').trim().isEmail().escape(),
  body('password').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.errors });
    }
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) return res.status(401).json({ message: 'User not found' });

      bcrypt.compare(req.body.password, user.password, (err, success) => {
        //if successful password
        if (success) {
          const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
            expiresIn: '2 days',
          });
          return res.status(200).json({
            message: 'User successfully signed in',
            token,
            email: user.email,
            user_id: user.id,
          });
        } else {
          return res.status(401).json({ message: 'Incorrect password!' });
        }
      });
    });
  },
];

//NEED TO FINISH SEARCH ENGINE
exports.searchUsers = function (req, res, next) {
  let searchInfo = req.query.q || '';
  console.log(req.query.q);

  User.find(
    {
      $or: [
        { firstName: new RegExp(searchInfo, 'i') },
        { lastName: new RegExp(searchInfo, 'i') },
      ],
    },
    'firstName lastName profilePicture'
  )
    .limit(5) //will only show 5 people in each search
    .populate({
      path: 'friendRequests',
      populate: {
        path: 'from',
        model: 'User',
        select: 'firstName lastName profilePicture',
      },
    })
    .then((searchedPeople) => {
      res.status(200).json(searchedPeople);
    })
    .catch((error) => {
      return next(error);
    });
};

//exports.deleteUser = function (req, res, next) {};

//exports.signOut = function (req, res, next) {};
