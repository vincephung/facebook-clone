let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FriendRequestSchema = new Schema({
  timeStamp: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'] },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
