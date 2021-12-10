const Router = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const router = Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ]
}));
router.get('/auth/google/callback', passport.authenticate( 'google', {
   successRedirect: '/user',
   failureRedirect: '/login'
}));

router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, { session: false }, (err) => {
        if (err) throw err;
        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, "TOP_SECRET");
        console.log(token);
        return res.json({ token }); //.send("Successfully Authenticated");
      });
    }
  })(req, res, next);
});

router.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        profile: req.body.profile,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});

router.get("/logout", function (req, res) {
  req.logOut(); // <-- not req.logout();
  res.send("Usuario no logueado");
});

module.exports = router;
