const Router = require("express");
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const router = Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://eventy-main.vercel.app/login",
  }),
  function (req, res) {
    res.redirect("https://eventy-main.vercel.app");
  }
);
router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, { session: true }, (err) => {
        if (err) throw err;
        console.log("AUTENTICATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return res.send("Successfully Authenticated");
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

router.post("/forgot", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) res.send("No User Exists");
  else {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "eventy.mailer.service@gmail.com" /* Your Email */,
        pass: "eventymailer" /* Your Password */,
      },
    });
    const mailOptions = {
      from: "eventy.mailer.service@gmail.com",
      to: user.email,
      subject: "Password Reset",
      text:
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
        "https://eventy-main.vercel.app/reset/" +
        user._id +
        "\n\n" +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };
    transporter.sendMail(mailOptions, function (err) {
      if (err) throw err;
      res.send("Email Sent");
    });
  }
});

router.post("/reset/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) res.send("No User Exists");
  else {
    console.log(user);
    console.log(req.params.id);    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.findOneAndUpdate(
      { _id: req.params.id },
      { password: hashedPassword },
      { new: true }
    );
    res.send("Password Changed");
  }
});

module.exports = router;
