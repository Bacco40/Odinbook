const Post = require('../models/post');
const Notification = require('../models/notifications');
const { body,validationResult } = require('express-validator');
const async = require('async');
const User = require('../models/user');

exports.index = function(req, res) {
    async.series({
        user: function(callback) {
            User.findById(req.params.id)
            .select('friends')
            .populate({path:'friends', 
              populate: {path:'user_id', select: 'username' }
            })
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        if (results.user===null) { // No results.
            var err = new Error('User dont exist');
            err.status = 404;
            return res.json(err);
        }
        // Successful, so render.
        const postCreators = [`${req.params.id}`];
        for(let i=0; i<results.user.friends.length; i++){
            if(results.user.friends[i].confirmed === true){
                postCreators[i+1]=results.user.friends[i].user_id.id
            }
        }
        async.series({
            allPosts: function(callback) {
                Post.find({ 'creator': {$in: postCreators} })
                .populate({path:'creator', select: 'username name surname profile_pic' })
                .populate({path:'comments', 
                options: { sort: { 'date_of_creation': 1 } } ,
                populate: {path:'creator', select: 'name surname profile_pic' }
                })
                .sort({date_of_creation : -1})
                .exec(callback)
            },
        }, function(err, results2) {
            if (err) { return res.json(err); }
            return res.json({posts: results2.allPosts} );
        })
    });
};

// Display detail page for a specific Post.
exports.post_detail = function(req, res) {
    async.parallel({
        post: function(callback) {
          Post.findById(req.params.id)
          .populate({path:'creator', select: 'username name surname profile_pic' })
          .populate({path:'comments', 
            options: { sort: { 'date_of_creation': 1 } } ,
            populate: {path:'creator', select: 'name surname profile_pic' }
          })
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        if (results.post==null) { // No results.
            var err = new Error('Post not found');
            err.status = 404;
            return res.json(err);
        }
        // Successful, so render.
        return res.json({ post: results.post } );
    });
};

// Handle Post create on POST.
exports.post_create_post = [

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors posts.
            return res.json({errors: errors.array() });
        }
        else {
            // Data from form is valid.
            let post=null;
            if(req.body.image_url){
                if(req.body.postContent !== ""){
                    post = new Post(
                    {
                        image_url: req.body.image_url,
                        post: req.body.postContent,
                        creator: req.body.user
                    }); 
                }
                else{
                    post = new Post(
                    {
                        post: req.body.postContent,
                        creator: req.body.user
                    }); 
                }
            }
            else{
                post = new Post(
                {
                    post: req.body.postContent,
                    creator: req.body.user
                }); 
            }
            
            post.save(function (err) {
                if (err) { return res.json(err); }
                // Successful 
                return res.json(post);
            });
        }
    }
];

// Handle Post delete.
exports.post_delete = function(req, res) {
    async.parallel({
        post: function(callback) {
            Post.findById(req.params.id)
              .exec(callback)
        }
    }, function(err, results) {
        if (err) { return res.json(err); }
        // Success
        else {
            Post.findByIdAndRemove(req.params.id, function deletePost(err) {
                if (err) { return res.json(err); }
                Notification.deleteMany({'notification.post_ref' : req.params.id}, function(err) {
                    return res.json(true)
                })
            })
        }
    });
};

// Handle Post update on PUT.
exports.post_update_put = [

    // Validate and sanitize fields.
    body('postContent').trim().isLength({ min: 1, max:2000}).withMessage('Post must be specified, and must be maximum 2000 character long.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors posts.
            return res.json({ errors: errors.array() });
        }
        else {
            // Data from form is valid.
            let post=null;
                if(req.body.image_url){
                   post = new Post(
                    {
                        image_url: req.body.image_url,
                        post: req.body.postContent,
                        creator: req.body.user,
                        comments: req.body.comments,
                        likes: req.body.likes,
                        date_of_creation: req.body.date_of_creation,
                        _id: req.params.id
                    }); 
                }
                else{
                    post = new Post(
                    {
                        post: req.body.postContent,
                        creator: req.body.user,
                        comments: req.body.comments,
                        likes: req.body.likes,
                        date_of_creation: req.body.date_of_creation,
                        _id: req.params.id
                    }); 
                }
            Post.findByIdAndUpdate(req.params.id, post, {}, function (err) {
                if (err) { return res.json(err); }
                // Successful - redirect to home page.
                return res.json(true);
            });
        }
    }
];

exports.post_liked_put = function(req, res) {
    async.parallel({
        userLiked: function(callback) {
            User.findById(req.body.user_id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return res.json(err); }
            const postNotification = new Notification({
                type: 1,
                user: req.body.creator,
                notification:{
                    user_ref: req.body.user_id,
                    content: 'liked',
                    post_ref: req.params.id,
                }
              })
            Post.findById(req.params.id, function(err, post) {
                if (err) return res.json(err);
                post.likes.push(results.userLiked);
                post.save(function(err) {
                    if (err) { return res.json(err); }
                    postNotification.save(function (err) {
                        if (err) { return res.json(err); }
                        return res.json(true);
                    })
                }); 
            })
        }
    )
}

exports.post_removed_liked_put = function(req, res) {
    async.parallel({
        userLiked: function(callback) {
            User.findById(req.body.user_id).exec(callback);
        },
        notification: function(callback) {
            Notification.findOne({'notification.post_ref' : req.params.id , 'notification.user_ref' :  req.body.user_id , 'notification.content' : 'liked'})
              .exec(callback)
          }
        }, function(err, results) {
            if (err) { return res.json(err); }
            console.log(req.params.id , req.body.user_id)
            Post.findById(req.params.id, function(err, post) {
                if (err) return res.json(err);
                post.likes.pull(results.userLiked);
                post.save(function(err) {
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

exports.post_saved_put = function(req, res) {
    async.parallel({
        postSaved: function(callback) {
            Post.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return res.json(err); }
            User.findById(req.body.user_id, function(err, user) {
                if (err) return res.json(err);
                user.saved_post.push(results.postSaved);
                user.save(function(err) {
                    if (err) { return res.json(err); }
                    return res.json(true);
                }); 
            })
        }
    )
}

exports.post_removed_from_saved_put = function(req, res) {
    async.parallel({
        postSaved: function(callback) {
            Post.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return res.json(err); }
            User.findById(req.body.user_id, function(err, user) {
                if (err) return res.json(err);
                user.saved_post.pull(results.postSaved);
                user.save(function(err) {
                    if (err) { return res.json(err); }
                    return res.json(true);
                }); 
            })
        }
    )  
}
