var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NotificationSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: Number, required: true},
    friend_request: {type: Schema.Types.ObjectId, ref: 'User'},
    notification:{
        user_ref: {type: Schema.Types.ObjectId, ref: 'User'},
        content: {type: String},
        post_ref: {type: Schema.Types.ObjectId, ref: 'Post'},
        date: {type: Date, required: true, default: Date.now},
        opened: {type: Boolean, default:false},
        comment_ref: {type: Schema.Types.ObjectId, ref: 'Comment'},
    },
  }
);

//Export model
module.exports = mongoose.model('Notification', NotificationSchema);