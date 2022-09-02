var async = require('async');
const { body,validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const Post = require('../models/post');
const Notification = require('../models/notifications');
const passport = require("passport");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('../config/passport')(passport);
require('dotenv/config');

// Display profile page for a specific User and his post.
exports.user_detail = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
            .select('username name surname profile_pic cover_pic friends bio date_of_birth')
            .populate({path:'friends', 
              populate: {path:'user_id', select: 'name surname profile_pic' }
            })
            .exec(callback)
        },
        posts: function(callback) {
          Post.find({ 'creator': req.params.id })
          .populate({path:'creator', select: 'username name surname profile_pic' })
          .populate({path:'comments', 
            options: { sort: { 'date_of_creation': 1 } } ,
            populate: {path:'creator', select: 'name surname profile_pic' }
          })
          .sort({date_of_creation : -1})
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return res.json(err); } // Error in API usage.
        if (results.user==null) { // No results.
            var err = new Error('User dont exist');
            err.status = 404;
            return res.json(err);
        }
        // Successful, so render.
        return res.json({user: results.user , posts: results.posts} );
    });
};

// Return basic detail for a specific User.
exports.user_basic_detail = function(req, res, next) {
  async.parallel({
      user: function(callback) {
          User.findById(req.params.id)
          .select('username name surname profile_pic friends saved_post')
          .populate({path:'friends', 
              populate: {path:'user_id', select: 'name surname profile_pic' }
            })
          .exec(callback)
      }
  }, function(err, results) {
      if (err) { return res.json(err); } // Error in API usage.
      if (results.user==null) { // No results.
          var err = new Error('User dont exist');
          err.status = 404;
          return res.json(err);
      }
      async.series({
        savedPosts: function(callback) {
            Post.find({ '_id': {$in: results.user.saved_post} })
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
        // Successful, so render.
        return res.json({user: results.user, saved_post: results2.savedPosts} );
      })
  });
};

// Handle User log in on POST.
exports.user_log_in_post = function(req, res, next) {
  passport.authenticate('local', {session: false}, (err, user) => {
    if (err || !user) {
      return res.json({
        post: err,
        user : user
      });
    }
    req.login(user, {session: false}, (err) => {
      if (err) {
        res.json(err);
      }
      // generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({user}, process.env.SECRET_KEY);
      return res.json({user, token});
    });
  })(req, res);
};

exports.google_logIn = function(req,res,next){
  passport.authenticate('google', {session: false}, (err, user) => {
    if (err || !user) {
      return res.json({
        post: err,
        user : user
      });
    }
    req.login(user, {session: false}, (err) => {
      if (err) {
        res.json(err);
      }
      const idNewUser = mongoose.Types.ObjectId();
      const userCreated = new User({
        _id: idNewUser,
        name: user.name.givenName,
        surname: user.name.familyName,
        username: user.emails[0].value,
        google_id: user.id,
        profile_pic: user.photos[0].value,
        bio: `Hello everyone! my name is ${user.name.givenName} ${user.name.familyName} 👋`,
        friends: [{
          user_id: '62d6b1596206b22877ee83da',
          confirmed: true
        }]
      })
      const objFriends = {
        user_id: idNewUser,
        confirmed: true
      }
      User.findOne({ 'google_id': user.id })
        .exec( function(err, found_id) {
          if (err) { 
            return res.json(err); 
          }
          if (found_id) {
            const token = jwt.sign({found_id}, process.env.SECRET_KEY);
            res.cookie('token',token, {maxAge : 5000})
            res.cookie('user',found_id.id, {maxAge : 5000})
            res.cookie('username',found_id.username, {maxAge : 5000})
            return res.redirect('/')
          }
          else {
            // Data from form is valid. Save user.
            userCreated.save(function (err) {
              if (err) {return res.json(err); }
              User.findOneAndUpdate(
                { _id: '62d6b1596206b22877ee83da'}, 
                { $push: { friends: objFriends  } },
              function (err) {if (err) { return res.json(err); }
                const token = jwt.sign({userCreated}, process.env.SECRET_KEY);
                res.cookie('token',token, {maxAge : 5000})
                res.cookie('user',userCreated.id, {maxAge : 5000})
                res.cookie('username',userCreated.username, {maxAge : 5000})
                return res.redirect('/')
            })});
          }
        })
    })
    
  })(req, res);
};

// Handle User create on POST.
exports.user_create_post =[

    // Validate and sanitize fields.
    body('username', 'Username must have 6 characters.').trim().isLength({ min: 6 }).escape(),
    body('password', 'Password must be at least 8 character.').trim().isLength({ min: 8 }).escape(),
    body('name', 'Name not inserted or longer than 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),
    body('surname', 'Surname not inserted or longer than 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),
    body('confPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
    }),

     // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        let password1='';
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) { 
                return res.json(err);
            }
            password1=hashedPassword;
            const idNewUser = mongoose.Types.ObjectId();
            const user = new User({
                _id: idNewUser,
                username: req.body.username,
                password: password1,
                name: req.body.name,
                surname: req.body.surname,
                date_of_birth: req.body.date_of_birth,
                bio: req.body.bio,
                friends: [{
                  user_id: '62d6b1596206b22877ee83da',
                  confirmed: true
                }]
            })
            const objFriends = {
              user_id: idNewUser,
              confirmed: true
            }
            if (!errors.isEmpty()) {
              return res.json({errors: errors.array() });
            }else{
                User.findOne({ 'username': req.body.username })
                .exec( function(err, found_username) {
                   if (err) { return res.json(err); }
        
                   if (found_username) {
                     const post = [{msg:'Username already taken'}];
                     // User username exists, redirect to its detail page.
                     return res.json({errors: post });
                   }
                   else {
                    // Data from form is valid. Save user.
                    user.save(function (err) {
                        if (err) { return res.json(err); }
                        User.findOneAndUpdate(
                          { _id: '62d6b1596206b22877ee83da'}, 
                          { $push: { friends: objFriends  } },
                          function (err) {if (err) { return res.json(err); }
                            return res.json(true);
                          })
                    });
                  }
            })
            }
        })  
}];

exports.user_edit_put = [

  // Validate and sanitize fields.
  body('username', 'Username must have 6 characters.').trim().isLength({ min: 6 }).escape(),
  body('name', 'Name not inserted or longer than 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),
  body('surname', 'Surname not inserted or longer than 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),

   // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.json({errors: errors.array() });
      }
      else{
        User.findOne({ 'username': req.body.username })
        .exec( function(err, found_username) {
            if (err) { return res.json(err); }
            if (found_username && found_username.id !== req.params.id) {
              const post = [{msg:'Sorry, username already taken'}];
              // User username exists, redirect to its detail page.
              return res.json({errors: post });
            }
            else {
              const userEdit = new User({
                  username: req.body.username,
                  name: req.body.name,
                  surname: req.body.surname,
                  date_of_birth: req.body.date_of_birth,
                  bio: req.body.bio,
                  profile_pic: req.body.profile_pic,
                  cover_pic: req.body.cover_pic,
                  friends: req.body.friends,
                  saved_post: req.body.saved,
                  _id: req.params.id
              })
            // Data from form is valid. Save user.
              User.findByIdAndUpdate(req.params.id, userEdit, {}, function (err) {
                if (err) { return res.json(err); }
                // Success
                return res.json(true);
              });
            }
        })
      }
}];

//Handle list of user to add as friend
exports.user_get_possible_friend_to_add = function (req, res) {
  async.parallel({
    userFriend: function(callback) {
        User.find({ "friends.user_id": { "$ne": [`${req.params.id}`] } })
        .select('username name surname profile_pic')
        .limit(4)
        .exec(callback)
    },
  }, function(err, results) {
      if (err) { return res.json(err); } // Error in API usage.
      // Successful, so render.
      return res.json({user: results.userFriend} );
  });
}

//Handle add friend request
exports.user_add_friend = function (req, res){
  const objFriends = {
    user_id: req.body.user_id,
    confirmed: false
  }
  const userNotification = new Notification({
    type: 0,
    user: req.body.user_id,
    friend_request: req.params.id
  })
  User.findOneAndUpdate(
      { _id: req.params.id }, 
      { $push: { friends: objFriends  } },
    function (err) {
      if (err) { return res.json(err); }
      userNotification.save(function (err) {
        if (err) { return res.json(err); }
        return res.json(true);
      });
    }
  );
}

//Handle delete friend request
exports.user_cancel_friend_request = function(req, res) {
  async.series({
      user: function(callback) {
          User.findById(req.params.id)
            .populate({path:'friends', 
            populate: {path:'user_id', select: 'name surname profile_pic' }
            })
            .exec(callback)
      },
      notification: function(callback) {
        Notification.findOne({friend_request : req.params.id })
          .where('user').equals(req.body.user_id)
          .exec(callback)
      }
  }, function(err, results) {
      if (err) { return res.json(err); }
      // Success
      else {
          let arrayId = null;
          for(let i=0; i<results.user.friends.length; i++){
            if(results.user.friends[i].user_id.id === req.body.user_id){
              arrayId=results.user.friends[i]._id
            }
          }
          Notification.findByIdAndRemove(results.notification.id, function deletePost(err) {
            if (err) { return res.json(err); }
            User.findOneAndUpdate({ _id: req.params.id }, { $pull: {friends: {_id : arrayId}},}, function(err) {
              if (err) { return res.json(err); }
              return res.json(true)
            })
          })  
      }
  });
};

exports.user_confirm_friend = function(req,res){
  async.series({
    user_requesting: function(callback) {
      User.findById(req.body.user_id)
        .populate({path:'friends', 
          populate: {path:'user_id', select: 'name surname profile_pic' }
        })
        .exec(callback)
    },
    notification: function(callback) {
      Notification.findOne({friend_request : req.body.user_id , user : req.params.id })
        .exec(callback)
    }
}, function(err, results) {
    if (err) { return res.json(err); }
    // Success
    else {
      let arrayId = null;
      for(let i=0; i<results.user_requesting.friends.length; i++){
        if(results.user_requesting.friends[i].user_id.id === req.params.id){
          console.log()
          arrayId=results.user_requesting.friends[i]._id
        }
      }
      const objFriends = {
        user_id: req.body.user_id,
        confirmed: true
      }
      User.findOneAndUpdate(
        { _id: req.params.id }, 
        { $push: { friends: objFriends  } },
        function (err) {
          if (err) { return res.json(err); }
          Notification.findByIdAndRemove(results.notification.id, function deletePost(err) {
            if (err) { return res.json(err); }
            User.updateMany(
              { _id: req.body.user_id, "friends._id": arrayId },
              {$set: {"friends.$.user_id": req.params.id ,"friends.$.confirmed": true,}},
              function (err) {
                if (err) { return res.json(err); }
                return res.json(true)
              }
            )
          })
        }
      )
    }
  })
}

exports.user_remove_friends = function (req, res){
  async.series({
    user_removed: function(callback) {
      User.findById(req.body.user_id)
        .populate({path:'friends', 
          populate: {path:'user_id', select: 'name surname profile_pic' }
        })
        .exec(callback)
    },
    user_removing: function(callback) {
      User.findById(req.params.id)
        .populate({path:'friends', 
          populate: {path:'user_id', select: 'name surname profile_pic' }
        })
        .exec(callback)
    },
  }, function(err, results) {
    if (err) { return res.json(err); }
    // Success
    else {
      let removedId = null;
      for(let i=0; i<results.user_removed.friends.length; i++){
        if(results.user_removed.friends[i].user_id.id === req.params.id){
          removedId=results.user_removed.friends[i]._id
        }
      }
      let removingId = null;
      for(let a=0; a<results.user_removing.friends.length; a++){
        if(results.user_removing.friends[a].user_id.id === req.body.user_id){
          removingId=results.user_removing.friends[a]._id
        }
      }
      const userNotification = new Notification({
        type: 0,
        user: req.params.id,
        friend_request: req.body.user_id
      })
      User.findOneAndUpdate(
        { _id: req.params.id }, 
        { $pull: {friends: {_id : removingId}},},
        function (err) {
          if (err) { return res.json(err); }
          userNotification.save(function (err) {
            if (err) { return res.json(err); }
            User.updateMany(
              { _id: req.body.user_id, "friends._id": removedId },
              {$set: {"friends.$.user_id": req.params.id ,"friends.$.confirmed": false,}},
              function (err) {
                if (err) { return res.json(err); }
                return res.json(true)
              }
            )
          })
        }
      )
    }
  })
}

exports.search_user = function(req,res){
  async.parallel({
    user_by_name: function(callback) {
        User.find({name: { $regex: '.*' + req.params.id + '.*' , $options: 'i'} })
        .select('name surname profile_pic ')
        .limit(3)
        .exec(callback)
    },
    user_by_surname: function(callback) {
      User.find({surname: { $regex: '.*' + req.params.id + '.*' , $options: 'i'} })
      .select('name surname profile_pic ')
      .limit(3)
      .exec(callback)
  },
}, function(err, results) {
    if (err) { return res.json(err); } // Error in API usage.
    // Successful, so render.
    return res.json({user_by_name: results.user_by_name , user_by_surname: results.user_by_surname} );
});
}

exports.test = function(req, res) {
  return res.json(true);
}