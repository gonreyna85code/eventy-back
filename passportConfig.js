const User = require("./models/user");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

module.exports = function (passport) {
  passport.use(
    "login",
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

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: "TOP_SECRET",
        jwtFromRequest: ExtractJWT.fromHeader("secret_token"),
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

  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "660766853123-10tfek3hfs64f0t7tpvqmg0l0olhg17v.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL:
          "https://gonzalo-eventy3.herokuapp.com/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        return done(err, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serUser", user);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log("desUser", user);
    done(null, user);
  });
};
