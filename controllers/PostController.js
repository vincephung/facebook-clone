require('dotenv').config();
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const { validationResult, body } = require('express-validator');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//get all users and the users friends posts
exports.getAllPosts = function (req, res) {
  const usertoken = req.headers.authorization;
  const token = usertoken.split(' ');
  const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
  let currentUserId = decoded._id;

  User.findById(currentUserId).then((currentUser) => {
    Post.find({
      $or: [{ user: currentUserId }, { user: { $in: currentUser.friends } }],
    })
      .populate('user', 'firstName lastName profilePicture')
      .populate({
        path: 'users',
        populate: { path: 'user', model: 'User', select: 'firstName lastName' },
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstName lastName profilePicture',
        },
      })
      .sort({ currentUserId: -1 })
      .then((posts) => {
        if (!posts) {
          res.json('Failed to retrieve all posts');
        }
        res.status(200).json(posts); //successfully got all posts
      })
      .catch((err) => {
        return next(err);
      });
  });
};

exports.getPost = function (req, res) {
  Post.findById(req.params.id).then((post) => {
    if (!post) {
      res.json({ error: 'Post does not exist' });
      return;
    }
    res.status(200).json(post); //successfully retrieve post
  });
};

exports.createPost = [
  body('text')
    .trim()
    .escape()
    .isLength({ minLength: 1 })
    .withMessage('Must enter text'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.errors });
    }

    cloudinary.uploader.upload(req.body.picture, {}, (err, uploadedPicture) => {
      const newPost = new Post({
        timeStamp: moment().format('MMMM Do[,] YYYY'),
        text: req.body.text,
        user: req.body.user_id,
        picture: uploadedPicture.url,
      });
      newPost
        .save()
        .then((newPost) => {
          res.json({ message: 'New Post successful', newPost });
        })
        .catch((err) => {
          return next(err);
        });
    });
  },
];

exports.updatePost = [
  body('text')
    .trim()
    .escape()
    .isLength({ minLength: 1 })
    .withMessage('Post cannot be empty!'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.errors });
    }
    const updatedPost = {
      timeStamp: moment().format('MMMM Do[,] YYYY'),
      text: req.body.text,
      picture: req.body.picture,
    };
    Post.findByIdAndUpdate(req.params.id, updatedPost, { new: true })
      .then((updated) => {
        res.status(200).json({ message: 'Post updated', updated });
      })
      .catch((err) => {
        return next(err);
      });
  },
];

exports.deletePost = function (req, res, next) {
  Post.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: 'Post deleted' });
  });
};

exports.getPostReactions = function (req, res) {
  Post.findById(req.params.id)
    .populate('reactions', 'type')
    .populate({
      path: 'reactions',
      populate: { path: 'user', model: 'User', select: 'firstName lastName' },
    })
    .then((reactions) => {
      if (!reactions) {
        res.status(400).json('Post not found');
        return;
      }
      res.status(200).json(reactions);
    });
};

//react to a post
const reactionList = ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'];
exports.putPostReaction = [
  body('type').custom((value, { req }) => reactionList.includes(value)),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.errors });
      return;
    }
    let newReaction = new Reaction({
      type: req.body.type,
      user: req.body.user_id,
      post: req.params.id,
    });

    newReaction.save().then((reaction) => {
      Post.findByIdAndUpdate(
        req.params.id,
        { $push: { reactions: reaction } },
        { new: true }
      )
        .then((post) => {
          reaction
            .populate('user', 'firstName lastName')
            .execPopulate()
            .then((addedReaction) => {
              res.status(200).json(addedReaction);
            });
        })
        .catch((err) => {
          return next(err);
        });
    });
  },
];

exports.removePostReaction = function (req, res, next) {
  Reaction.findByIdAndDelete(req.params.reactionId, (err, doc) => {
    if (err) return next(err);
    res.status(200).json({ message: 'Reaction removed' });
  });
};
