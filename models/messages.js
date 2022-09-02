var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
  {
    user_inbox: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    messages: [{
        from_user: {type: Schema.Types.ObjectId, ref: 'User'},
        to_user: {type: Schema.Types.ObjectId, ref: 'User'},
        message: {type: String, required: true},
        date_of_creation: {type: Date, required: true, default: Date.now},
        read: {type: Boolean, default: false}
    }]
  }
);

//Export model
module.exports = mongoose.model('Messages', MessageSchema);