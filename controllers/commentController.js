const Comment = require('../models/comments');
const Notification = require('../models/notifications');
const Post = require('../models/post');
const User = require('../models/user')
const async = require('async');
const mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

// Handle Comment create on POST.
exports.comment_create_post = [

    // Validate and sanitize fields.
    body('comment').trim().isLength({ min: 1, max:200 }).withMessage('Comment must be specified and can have maximum 200 character.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            Post.find({})
            .sort({date_of_creation : -1})
            .populate('creator')
            .populate('comments')
            .exec(function (err, posts) {
                if (err) { return res.json(err);}
                // There are errors. Render form again with sanitized values/errors posts.
                return res.json({errors: errors.array()});
            })
        }
        else {
            // Data from form is valid.
            const idComment = mongoose.Types.ObjectId();

            const comment = new Comment(
            {
                _id: idComment,
                comment: req.body.comment,
                creator: req.body.user,
                post_ref: req.params.id
            });
            const postNotification = new Notification({
                type: 1,
                user: req.body.creator,
                notification:{
                    user_ref: req.body.user,
                    content: 'commented',
                    post_ref: req.params.id,
                    comment_ref: idComment
                }
                })
            comment.save(function (err) {
                if (err) { return res.json(err);}
                //Successful
                Post.findById(req.params.id, function(err, post) {
                    if (err) return res.json(err);
                    post.comments.push(comment);
                    post.save(function(err) {
                      if (err) { return res.send(err); }
                      postNotification.save(function (err) {
                        if (err) { return res.json(err); }
                        return res.json(true);
                      })
                    })
                });
            })
        }
    }
];

// Handle Comment delete.
exports.comment_delete= function(req, res) {
    async.parallel({
        comment: function(callback) {
            Comment.findById(req.params.id)
              .exec(callback)
        },
        notification: function(callback) {
            Notification.findOne({'notification.comment_ref' : req.params.id , 'notification.user_ref' :  req.body.user , 'notification.content' : 'commented'})
              .exec(callback)
          }
    }, function(err, results) {
        if (err) { return res.json(err); }
        // Success
        else {
            Comment.findByIdAndRemove(req.params.id, function deleteComment(err,comment) {
                if (err) { return res.json(err); }
                //Successful
                Post.findById(results.comment.post_ref, function(err, post) {
                    if (err) return res.send(err);
                    post.comments.pull(comment);
                    post.save(function(err) {
                      if (err) { return res.send(err); }
                      Notification.findByIdAndRemove(results.notification.id, function deletePost(err) {
                        if (err) { return res.json(err); }
                        return res.json(true);
                      })
                    })
                });
            })
        }
    });
};

//Handle comment edit on put
exports.comment_edit =[
    // Validate and sanitize fields.
    body('commentEdited').trim().isLength({ min: 1, max:200 }).escape().withMessage('Comment must be specified and can have maximum 200 character.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors .
            return res.json({ errors: errors.array() });
        }
        else {
            // Data from form is valid.
            const comment = new Comment(
                {
                    _id: req.params.id,
                    comment: req.body.commentEdited,
                    creator: req.body.user,
                    post_ref: req.body.ref,
                    date_of_creation: req.body.date
                });
            Comment.findByIdAndUpdate(req.params.id, comment, {}, function (err) {
                if (err) { return res.json(err); }
                // Successful - redirect to book detail page.
                return res.json(true);
            });
        }
    }
]

exports.comment_liked_put = function(req, res) {
    async.parallel({
        userLiked: function(callback) {
            User.findById(req.body.user_id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return res.json(err); }
            const commentNotification = new Notification({
                type: 1,
                user: req.body.creator,
                notification:{
                    user_ref: req.body.user_id,
                    content: 'liked your',
                    post_ref: req.body.post_ref,
                    comment_ref: req.params.id
                }
            })
            Comment.findById(req.params.id, function(err, comment) {
                if (err) return res.json(err);
                comment.likes.push(results.userLiked);
                comment.save(function(err) {
                    if (err) { return res.json(err); }
                    commentNotification.save(function (err) {
                        if (err) { return res.json(err); }
                        return res.json(true);
                    })
                }); 
            })
        }
    )
}

exports.comment_removed_liked_put = function(req, res) {
    async.parallel({
        userLiked: function(callback) {
            User.findById(req.body.user_id).exec(callback);
        },
        notification: function(callback) {
            Notification.findOne({'notification.comment_ref' : req.params.id , 'notification.user_ref' :  req.body.user_id , 'notification.content' : 'liked your'})
              .exec(callback)
          }
        }, function(err, results) {
            if (err) { return res.json(err); }
            Comment.findById(req.params.id, function(err, comment) {
                if (err) return res.json(err);
                comment.likes.pull(results.userLiked);
                comment.save(function(err) {
                    if (err) { return res.json(err); }
                    Notification.findByIdAndRemove(results.notification.id, function deletePost(err) {
                        if (err) { return res.json(err); }
                        return res.json(true);
                      })
                }); 
            })
        }
    )    
}