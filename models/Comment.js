let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
  text: { type: String, required: true },
  timeStamp: { type: String },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
});

module.exports = mongoose.model('Comment', CommentSchema);
