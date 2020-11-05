require('dotenv').config();
require('./mongoConfig');
var faker = require('faker');
let User = require('./models/User');
let Post = require('./models/Post');

/*let users = [];
for (let i = 0; i < 10; i++) {
  let newUser = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    gender: 'Male',
    bio: faker.hacker.phrase(),
  };
  users.push(newUser);
}

User.insertMany(users);
*/

let posts = [];
for (let i = 0; i < 3; i++) {
  let newPost = {
    user: '5fa09b3309bfdf0f0af76219',
    text: faker.hacker.phrase(),
  };
  posts.push(newPost);
}

Post.insertMany(posts);
