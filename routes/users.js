var express = require('express');
var router = express.Router();
let UserController = require('../controllers/UserController');
const passport = require('passport');

//Get user profile including their posts
//need to authenticate that they are logged in
router.get(
  '/:id',
  passport.authenticate('jwt', {
    session: false,
  }),
  UserController.getUser
);
router.get(
  '/:id/posts',
  passport.authenticate('jwt', {
    session: false,
  }),
  UserController.getUserPosts
);
//create new user / sign up
//MAKE SURE TO ADD AUTHENTICATION
router.post('/', UserController.createUser);

//edit user profile
router.put(
  '/:id',
  passport.authenticate('jwt', {
    session: false,
  }),
  UserController.updateUser
);

//POST method to login user
router.post('/log-in', UserController.logIn);

//GET method to search for users
router.get(
  '/:id/search/',
  passport.authenticate('jwt', {
    session: false,
  }),
  UserController.searchUsers
);

module.exports = router;

/*
//Get user profile including their posts
//need to authenticate that they are logged in
router.get('/api/users/:id', UserController.getUser);

//create new user / sign up
//MAKE SURE TO ADD AUTHENTICATION
router.post('/api/users', UserController.createUser);

//edit user profile
router.put('/api/users/:id', UserController.updateUser);

//POST method to login user
router.post('/api/users/sign-in', UserController.signIn);

//GET method to search for users
router.get('/api/users/search/:id', UserController.searchUsers);
*/
