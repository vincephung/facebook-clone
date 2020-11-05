const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

exports.getAllComments = function (req, res, next) {};

exports.getComment = function (req, res, next) {};

//creates comment and pushes it to post
exports.createComment = [
  body('text')
    .trim()
    .escape()
    .isLength({ minLength: 1 })
    .withMessage('Comment cannot be empty!'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.errors });
      return;
    }
    const newComment = new Comment({
      text: req.body.text,
      timeStamp: moment().format('MMMM Do[,] YYYY'),
      user: req.body.user_id,
      post: req.params.postId,
    });
    newComment.save().then((addedComment) => {
      Post.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: addedComment } },
        { new: true }
      )
        .then((updatedPost) => {
          addedComment
            .populate('user', 'firstName lastName')
            .execPopulate()
            .then((comment) => {
              res.status(200).json(comment);
            });
        })
        .catch((err) => {
          return next(err);
        });
    });
  },
];

//comments can only like or dislike
exports.putCommentReaction = [
  body('type').equals('Like'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.errors });
      return;
    }
    let newReaction = new Reaction({
      type: req.body.type,
      user: req.body.user_id,
      post: req.params.postId,
      comment: req.params.commentId,
    });
    newReaction.save().then((reaction) => {
      Comment.findByIdAndUpdate(
        req.params.commentId,
        { $push: { reactions: reaction } },
        { new: true }
      )
        .then((comment) => {
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

exports.removeCommentReaction = function (req, res, next) {
  Reaction.findByIdAndDelete(req.params.reactionId, (err, doc) => {
    if (err) return next(err);
    res.status(200).json({ message: 'Reaction removed' });
  });
};

exports.updateComment = function (req, res, next) {};

exports.deleteComment = function (req, res, next) {};

exports.getCommentReactions = function (req, res, next) {};
