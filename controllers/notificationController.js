const Notification = require('../models/notifications');
const Message = require('../models/messages');
const async = require('async');
const mongoose = require('mongoose');

//handle friend request notification on GET
exports.notification_check = function(req, res){
    async.parallel({
        new_friend_requests: function(callback) {
          Notification.find({user: req.params.id, type:0, 'notification.opened' : false })
          .populate({path:'friend_request', select: 'name surname profile_pic' })
          .sort({'notification.date' : -1})
          .exec(callback)
        },
        old_friend_requests: function(callback) {
            Notification.find({user: req.params.id, type:0, 'notification.opened' : true })
            .populate({path:'friend_request', select: 'name surname profile_pic' })
            .sort({'notification.date' : -1})
            .exec(callback)
          },
          friend_requests: function(callback) {
            Notification.find({user: req.params.id, type:0})
            .populate({path:'friend_request', select: 'name surname profile_pic' })
            .sort({'notification.date' : -1})
            .exec(callback)
          },
          new_post_notification: function(callback){
            Notification.find({user: req.params.id, type:1, 'notification.opened' : false })
            .populate({path:'notification', 
              populate: [
                {path:'user_ref', select: 'name surname profile_pic' },
                {path:'post_ref', select: 'image_url'}
              ]
            })
            .sort({'notification.date' : -1})
            .exec(callback)
          },
          old_post_notification: function(callback){
            Notification.find({user: req.params.id, type:1, 'notification.opened' : true })
            .populate({path:'notification', 
              populate: [
                {path:'user_ref', select: 'name surname profile_pic' },
                {path:'post_ref', select: 'image_url'}
              ]
            })
            .sort({'notification.date' : -1})
            .exec(callback)
          },
          messages: function(callback){
            Message.findOne({user_inbox: req.params.id })
            .populate({path:'messages', 
                populate: {path:'from_user', select: 'id' },
              })
            .exec(callback)
          }
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        let num = 0;
        if(results.messages !== null){
          const userMessage= results.messages.messages
          for(let i=0;i<userMessage.length;i++){
            if(userMessage[i].from_user.id !== req.params.id && userMessage[i].read === false){
              num=num+1;
            }
          }
        }
        // Successful, so render.
        return res.json({ 
          new_friend_requests: results.new_friend_requests ,
          old_friend_requests: results.old_friend_requests, 
          friend_requests: results.friend_requests, 
          new_post_notification: results.new_post_notification, 
          old_post_notification: results.old_post_notification,
          number_of_message : num
        } );
    });
}

exports.notification_opened = function(req, res){
  console.log(req.params.id)
  Notification.updateMany({
    user: req.params.id, 
    type: req.body.type}, 
    { $set: { 'notification.opened': true } }, function (err) {
      if (err){
        return res.json(err)
      }
      else{return res.json(true);}
    }
  );
}