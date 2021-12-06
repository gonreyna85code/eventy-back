const Router = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const passport = require("passport");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");

const router = Router();



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

router.get("/user",passport.authenticate('jwt', { session: false }), async (req, res) => {
  const near = await Event.find({ location: req.user?.profile?.city });
  const follows = await Event.find({ category: req.user?.subscriptions });
  if (req.user) {
    User.findOne({ _id: req.user._id }, async (err, doc) => {
      if (err) throw err;
      if (!doc) res.send("User Not Found");
      if (doc) {
        doc.near = near;
        doc.follows = follows;
        doc.save();
        res.send(doc);
      }
    })
      .populate("follows")
      .populate("events");
  } else {
    res.send("Usuario no logueado");
  }
});

router.put("/user_update", (req, res, next) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (!doc) res.send("User Not Found");
    if (doc) {
      doc.profile = req.body.profile;
      await doc.save().then((r) => {
        console.log(doc);
        res.send("User Updated");
      });
    }
  });
});

module.exports = router;
