const { validationResult, body } = require('express-validator');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const moment = require('moment');

exports.getAllFriendRequests = function (req, res, next) {};

exports.getFriendRequest = function (req, res, next) {};

//creates friend request
exports.createFriendRequest = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.errors });
  }

  const newFriendRequest = new FriendRequest({
    timeStamp: moment().format('MMMM Do[,] YYYY'),
    status: 'Pending',
    fromUser: req.params.fromUserId,
    toUser: req.params.toUserId,
  });

  newFriendRequest.save().then((friendRequest) => {
    User.findByIdAndUpdate(req.params.fromUserId, {
      $push: { friendRequests: friendRequest },
    })
      .then((fromUser) => {
        User.findByIdAndUpdate(req.params.toUserId, {
          $push: { friendRequests: friendRequest },
        }).then((toUser) => {
          res
            .status(200)
            .json({ friendRequest, message: 'New Friend Request sent' });
        });
      })
      .catch((err) => {
        return next(err);
      });
  });
};

//changes status of friend request and edits user friends
exports.acceptFriendRequest = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.errors });
  }

  FriendRequest.findOneAndUpdate(
    {
      status: 'Pending',
      fromUser: req.params.fromUserId,
      toUser: req.params.toUserId,
    },
    { status: 'Accepted' },
    { new: true }
  ).then((updatedRequest) => {
    User.findByIdAndUpdate(req.params.fromUserId, {
      $push: { friends: req.params.toUserId },
    }).then((fromUser) => {
      User.findByIdAndUpdate(req.params.toUserId, {
        $push: { friends: req.params.fromUserId },
      })
        .then((toUser) => {
          res.status(200).json({ message: 'Friend request accepted.' });
        })
        .catch((err) => {
          return next(err);
        });
    });
  });
};

exports.deleteFriendRequest = function (req, res, next) {
  FriendRequest.findOneAndDelete(
    { fromUser: req.params.fromUserId, toUser: req.params.toUserId },
    (err, doc) => {
      if (err) return next(err);
      res.status(200).json({ message: 'Friend request declined' });
    }
  );
};
