var express = require('express');
var router = express.Router();
const passport = require('passport');
let FriendRequestController = require('../controllers/FriendRequestController');

// SEND FRIEND REQUEST
router.post(
  '/:fromUserId/:toUserId',
  passport.authenticate('jwt', {
    session: false,
  }),
  FriendRequestController.createFriendRequest
);

// ACCEPT FRIEND REQUEST
router.put(
  '/:fromUserId/:toUserId',
  passport.authenticate('jwt', {
    session: false,
  }),
  FriendRequestController.acceptFriendRequest
);

// DECLINE FRIEND REQUEST
router.delete(
  '/:fromUserId/:toUserId',
  passport.authenticate('jwt', {
    session: false,
  }),
  FriendRequestController.deleteFriendRequest
);

module.exports = router;
