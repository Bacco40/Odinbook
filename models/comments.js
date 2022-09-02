var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    comment: {type: String, required: true, maxLength: 200},
    date_of_creation: {type: Date, required: true, default: Date.now},
    post_ref: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
  }
);

//Export model
module.exports = mongoose.model('Comment', CommentSchema);