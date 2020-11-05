var express = require('express');
var router = express.Router();
const passport = require('passport');
let PostController = require('../controllers/PostController');

//this is the timeline for a user, shows their posts AND their
//friends posts as well
//check if they are authenticated
router.get(
  '/',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.getAllPosts
);

//get a specific post
router.get(
  '/:id',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.getPost
);

//GET request to get a posts reactions(likes)
router.get(
  '/:id/reactions',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.getPostReactions
);

//PUT request to add a reaction (it modifies the original post)
router.put(
  '/:id/reactions',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.putPostReaction
);

//DELETE request to remove a reaction
router.delete(
  '/:postId/reactions/:reactionId',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.removePostReaction
);

//POST for create a new post
router.post(
  '/',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.createPost
);

//PUT request for updating a post
router.put(
  '/:id',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.updatePost
);

//DELETE request for deleting a post
router.delete(
  '/:id',
  passport.authenticate('jwt', {
    session: false,
  }),
  PostController.deletePost
);

module.exports = router;
