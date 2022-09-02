const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const jwt = require('jsonwebtoken');
const ExtractJWT = passportJWT.ExtractJwt;
require('dotenv/config');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy((username, password, done) => {
          User.findOne({ username: username }, (err, user) => {
            if (err) { 
              return done(err);
            }
            if (!user) {
              return done(null, false, { message: "Username is incorrect" });
            }
            bcrypt.compare(password, user.password, (err, res) => {
              if (res) {
                // passwords match! log user in
                return done(null, user)
              } else {
                // passwords do not match!
                return done(null, false, { message: "Incorrect password" })
              }
            })
          });
        })
      );

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/login/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        return done(null,profile)
      }
    ));

    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey :  process.env.SECRET_KEY
      },
      function (jwtPayload, done){
        return done(null, jwtPayload);
      }
    ));
}