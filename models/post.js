var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    image_url: [{ type: String}],
    post: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    date_of_creation: {type: Date, required: true, default: Date.now},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
  }
);

//Export model
module.exports = mongoose.model('Post', PostSchema);