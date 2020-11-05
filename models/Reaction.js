const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
  type: { type: String, enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'] },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
});

module.exports = mongoose.model('Reaction', ReactionSchema);
