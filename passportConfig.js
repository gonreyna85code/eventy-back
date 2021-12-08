const User = require("./models/user");
const bcrypt = require("bcryptjs");
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

module.exports = function (passport) {  
  passport.use(
    'login',
    new localStrategy((username, password, done) => {      
      User.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  ); 

  passport.use(new GoogleStrategy({
    consumerKey: GOOGLE_CONSUMER_KEY,
    consumerSecret: GOOGLE_CONSUMER_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
  }
  ));
  
  passport.use(         
    new JWTstrategy(
      {
        secretOrKey: 'TOP_SECRET',
        jwtFromRequest: ExtractJWT.fromHeader('secret_token')
      },
      async (token, done) => {
        try {
          console.log(token);
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );  
};

