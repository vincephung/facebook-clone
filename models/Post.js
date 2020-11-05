let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PostSchema = new Schema({
  timeStamp: { type: String },
  picture: { type: String },
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

module.exports = mongoose.model('Post', PostSchema);
