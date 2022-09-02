const express = require('express');
const router = express.Router();
const passport = require("passport");

// Require controller modules.
const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');
const notification_controller = require('../controllers/notificationController');
const message_controller = require('../controllers/messageController');

/// USER ROUTES ///

//Verify log //
router.get('/test', passport.authenticate('jwt', { session: false }), user_controller.test);

// POST request for creating User.
router.post('/signup', user_controller.user_create_post);

// POST request for log in User.
router.post('/login', user_controller.user_log_in_post);

router.get('/login/google',passport.authenticate('google', {scope: ['profile', 'email']}));

// GET request for log in User from Google.
router.get('/login/google/callback', user_controller.google_logIn);

// GET request for User profile for homePage.
router.get('/home/user/:id', passport.authenticate('jwt', { session: false }), user_controller.user_basic_detail);

// GET request for User profile.
router.get('/user/:id', passport.authenticate('jwt', { session: false }), user_controller.user_detail);

// PUT request to edit User detail.
router.put('/edit/:id', passport.authenticate('jwt', { session: false }), user_controller.user_edit_put);

// GET request for friends that the user can add
router.get('/possiblefriend/:id', passport.authenticate('jwt', { session: false }), user_controller.user_get_possible_friend_to_add);

//POST request to send a friend request
router.post('/addFriend/:id', passport.authenticate('jwt', { session: false }), user_controller.user_add_friend);

//PUT request to confirm a friend request
router.put('/confirmFriend/:id', passport.authenticate('jwt', { session: false }), user_controller.user_confirm_friend);

//PUT friend request
router.put('/cancelRequest/:id', passport.authenticate('jwt', { session: false }), user_controller.user_cancel_friend_request);

//PUT remove friend request
router.put('/removeFriend/:id', passport.authenticate('jwt', { session: false }), user_controller.user_remove_friends);

//GET search user
router.get('/search/:id', passport.authenticate('jwt', { session: false }), user_controller.search_user);

/// POST ROUTES ///

// GET home page.
router.get('/homepage/:id', passport.authenticate('jwt', { session: false }), post_controller.index);

// POST request for creating Post.
router.post('/post/create', passport.authenticate('jwt', { session: false }), post_controller.post_create_post);

// DELETE request to delete Post.
router.delete('/post/:id/delete', passport.authenticate('jwt', { session: false }), post_controller.post_delete);

// PUT request to update Post.
router.put('/post/:id/update', passport.authenticate('jwt', { session: false }), post_controller.post_update_put);

// GET request for one Post.
router.get('/post/:id', passport.authenticate('jwt', { session: false }), post_controller.post_detail);

// PUT request to like Post.
router.put('/post/:id/like', passport.authenticate('jwt', { session: false }), post_controller.post_liked_put);

// PUT request to remove like Post.
router.put('/post/:id/removeLike', passport.authenticate('jwt', { session: false }), post_controller.post_removed_liked_put);

// PUT request to like Post.
router.put('/post/:id/saved', passport.authenticate('jwt', { session: false }), post_controller.post_saved_put);

// PUT request to remove like Post.
router.put('/post/:id/removeSaved', passport.authenticate('jwt', { session: false }), post_controller.post_removed_from_saved_put);

 /// COMMENT ROUTES ///

//POST request for creating Comment.
router.post('/comment/:id/create', passport.authenticate('jwt', { session: false }), comment_controller.comment_create_post);

// GET request to delete Comment.
router.put('/comment/:id/delete', passport.authenticate('jwt', { session: false }), comment_controller.comment_delete);

// PUT request to update Comment.
router.put('/comment/:id/update', passport.authenticate('jwt', { session: false }), comment_controller.comment_edit);

// PUT request to like Post.
router.put('/comment/:id/like', passport.authenticate('jwt', { session: false }), comment_controller.comment_liked_put);

// PUT request to remove like Post.
router.put('/comment/:id/removeLike', passport.authenticate('jwt', { session: false }), comment_controller.comment_removed_liked_put);

/// NOTIFICATION ROUTES ///

// PUT request to update opened notifications.
router.put('/notification/opened/:id', passport.authenticate('jwt', { session: false }), notification_controller.notification_opened);

//GET request to check notifications.
router.get('/notification/user/:id', passport.authenticate('jwt', { session: false }), notification_controller.notification_check);

/// MESSAGES ROUTES ///

//POST request to send messages
router.post('/message/:id/send', passport.authenticate('jwt', { session: false }), message_controller.send_message);

//POST request to recove chat messages
router.post('/message/:id/recove', passport.authenticate('jwt', { session: false }), message_controller.recove_user_message);

//GET request to recove user messaged
router.get('/message/user/:id', passport.authenticate('jwt', { session: false }), message_controller.recove_user_messaged);

//POST request to read chat messages
router.post('/message/:id/read', passport.authenticate('jwt', { session: false }), message_controller.message_read);

module.exports = router;
