var express = require('express');
var router = express.Router();
const passport = require('passport');
let CommentController = require('../controllers/CommentController');

//get all comments of a post
router.get(
  '/:postId/comments',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.getAllComments
);

//get one comment
router.get(
  '/:postId/comments/:commentId',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.getComment
);

//create new comment
router.post(
  '/:postId/comments',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.createComment
);

//put request to edit comment
router.put(
  '/:postId/comments/:commentId',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.updateComment
);

//get request to see reactions
router.get(
  '/:postId/comments/:commentId/reactions',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.getCommentReactions
);

//put request to edit comment and create reaction
router.put(
  '/:postId/comments/:commentId/reactions',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.putCommentReaction
);

//delete request to dislike or remove like
router.delete(
  '/:postId/comments/:commentId/reactions/:reactionId',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.removeCommentReaction
);

//delete comment
router.delete(
  '/:postId/comments/:commentId',
  passport.authenticate('jwt', {
    session: false,
  }),
  CommentController.deleteComment
);

module.exports = router;
