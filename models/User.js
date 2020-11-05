let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  // username: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bio: { type: String },
  joinDate: { type: String },
  birthday: { day: String, month: String, year: Number },
  profilePicture: { type: String },
  coverPicture: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'FriendRequest' }],
});

module.exports = mongoose.model('User', UserSchema);
