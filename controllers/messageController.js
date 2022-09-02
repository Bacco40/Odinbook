const Message = require('../models/messages');
const async = require('async');
const mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

exports.send_message= [

    // Validate and sanitize fields.
    body('message').trim().isLength({ min: 1}).withMessage('Message must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.json({errors: errors.array()});
        }
        else {
            // Data from form is valid.

            async.parallel({
                messageSend: function(callback) {
                    Message.findOne({user_inbox: req.params.id})
                      .exec(callback)
                },
                messageRec: function(callback) {
                    Message.findOne({user_inbox: req.body.user_id})
                      .exec(callback)
                  }
            }, function(err, results) {
                if (err) { return res.json(err); }
                // Success
                else {
                    const senderMessage = {
                        from_user: req.params.id,
                        to_user: req.body.user_id,
                        message: req.body.message,
                        read: false
                    }
                    if(results.messageSend === null){
                        const createMessage = new Message({
                            user_inbox: req.params.id,
                            messages: [senderMessage]
                        })
                        createMessage.save(function (err) {
                            if (err) { return res.json(err); }
                        })
                    }
                    else{
                        Message.findOne({user_inbox: req.params.id}, function(err, message) {
                            if (err) { return res.json(err); }
                            else{
                                message.messages.push(senderMessage);
                                message.save(function(err) {
                                    if (err) { return res.json(err); }
                                }); 
                            }
                        })
                    }
                    if(results.messageRec === null){
                        const createMessage1 = new Message({
                            user_inbox: req.body.user_id,
                            messages: [senderMessage]
                        })
                        createMessage1.save(function (err) {
                            if (err) { return res.json(err); }
                            return res.json(true)
                        })
                    }
                    else{
                        Message.findOne({user_inbox: req.body.user_id}, function(err, message1) {
                            if (err) { return res.json(err); }
                            else{
                                message1.messages.push(senderMessage);
                                message1.save(function(err) {
                                    if (err) { return res.json(err); }
                                    return res.json(true);
                                }); 
                            }
                        })
                    }
                }
            })
        }
    }
];

exports.recove_user_message = function(req, res) {
    async.parallel({
        messages: function(callback) {
            Message.findOne({'user_inbox' : req.params.id})
              .populate({path:'messages', 
                populate: {path:'to_user', select: 'id' },
              })
              .populate({path:'messages', 
                populate: {path:'from_user', select: 'id' },
              })
            .sort({'messages.date_of_creation' : -1})
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        const messageResult = results.messages.messages;
        const messageUser= [];
        for(let i = 0; i < messageResult.length; i++){
            if(messageResult[i].from_user.id === req.body.user_id || messageResult[i].to_user.id === req.body.user_id){
                messageUser.push(messageResult[i])
            }
        }
        return res.json({ messages: messageUser } );
    })
}

exports.recove_user_messaged = function(req, res) {
    async.parallel({
        messages: function(callback) {
            Message.findOne({'user_inbox' : req.params.id})
              .populate({path:'messages.to_user', select: 'name surname profile_pic' })
              .populate({path:'messages.from_user', select: 'name surname profile_pic' })
            .sort({'messages.date_of_creation' : -1})
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        if(results.messages !== null){
            const messageResult = results.messages.messages;
            if(messageResult.length > 0){
                let userMessaged =[];
                let index = 1;
                let isIn=false;
                if(messageResult[0].from_user._id !== req.params.id){
                    userMessaged[0] = messageResult[0].to_user
                }
                else{
                    userMessaged[0] = messageResult[0].from_user
                }
                for(let i=0;i<messageResult.length; i++){
                    for(let a=0;a<userMessaged.length;a++){
                        if(messageResult[i].from_user.id === userMessaged[a].id){
                            isIn = true;
                        }
                    }
                    if(isIn === false){
                        userMessaged[index] = messageResult[i].from_user;
                        index= index+1;
                    }
                    isIn=false;
                    for(let b=0;b<userMessaged.length;b++){
                        if(messageResult[i].to_user.id === userMessaged[b].id){
                            isIn = true;
                        }
                    }
                    if(isIn === false){
                        userMessaged[index] = messageResult[i].to_user;
                        index= index+1;
                    }
                    isIn=false;
                }
                let newMessage = [];
                newMessage = userMessaged.map(function(el) {
                    for(let d=0;d<messageResult.length;d++){
                        if (el.id ===  messageResult[d].from_user.id && messageResult[d].read === false && el.id !== req.params.id) {
                            var o = Object.assign({}, el);
                            o.read = false;
                            console.log(o)
                            return o;
                        }
                    }
                })
                const chatResults = newMessage.filter(element => {
                    return element !== undefined;
                });
                if(chatResults.length < userMessaged.length){
                    for(let i=0; i < userMessaged.length ; i++){
                        let exist = false;
                        for(let a=0; a < chatResults.length ; a++){
                            if(chatResults[a]._doc._id && userMessaged[i]._id === chatResults[a]._doc._id){
                                exist = true
                            }
                            else if(userMessaged[i].id === chatResults[a].id){
                                exist = true;
                            }
                        }
                        if(exist === false){
                            chatResults.push(userMessaged[i])
                        }
                    }
                }
                return res.json({ messages: chatResults } );
            }
        }
        else{
            return res.json( false );
        }
    })
}

exports.message_read = function (req, res){
    Message.findOneAndUpdate({user_inbox: req.params.id },
        {"$set": { "messages.$[elem].read": true}},
        {"arrayFilters": [
            {"elem.from_user": req.body.user_id}
        ]},
        function (err) {
            if (err) { return res.json(err); }
            return res.json(true)
        }
    )
}