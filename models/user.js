const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {type: String},
    password: {type: String, minLength: 8},
    name: {type: String, maxLength: 20},
    surname: {type: String, maxLength: 20},
    bio: {type: String, maxLength: 50},
    date_of_birth: {type: Date},
    profile_pic:{type:String} ,
    cover_pic:{type:String},
    friends:[{
        user_id:{type: Schema.Types.ObjectId, ref: 'User'},
        confirmed: {type: Boolean, default:false},
    }],
    google_id:{type: String},
    saved_post: [{type: Schema.Types.ObjectId, ref: 'User'}],
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);