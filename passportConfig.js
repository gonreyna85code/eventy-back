const User = require("./models/user");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      console.log("username: ", username);
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

  passport.serializeUser((user, cb) => {
    console.log("serializeUser: ", user);
    return cb(null, user._id);
  });
  passport.deserializeUser((id, cb) => {
    console.log("deserializeUser: ", id);
   return  User.findOne({ _id: id }, (err, user) => {
      return cb(err, user);
    });
  });
};
