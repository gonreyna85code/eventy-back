const User = require("./models/user");
const bcrypt = require("bcryptjs");
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
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

  passport.use('provider', new OAuthStrategy({
    requestTokenURL: "https://oauth2.googleapis.com/token",
    accessTokenURL: "https://oauth2.googleapis.com/token",
    userAuthorizationURL: "https://accounts.google.com/o/oauth2/auth",
    consumerKey: "660766853123-8eta4gn364u3q4oqpqhc2ic023dem5u5.apps.googleusercontent.com",
    consumerSecret: "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",
    callbackURL: "https://eventy-main.vercel.app/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(... function(err, user) {
      done(err, user);
    });
  }
));

  passport.use(new GoogleStrategy({
    consumerKey: '660766853123-8eta4gn364u3q4oqpqhc2ic023dem5u5.apps.googleusercontent.com',
    consumerSecret: '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',
    callbackURL: "https://eventy-main.vercel.app/auth/google/callback"
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

