require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const express = require("express");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const morgan = require('morgan');
const User = require("../models/user");

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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, cb) => {
  console.log("deserializeUser: ", id);
  return User.findOne({ _id: id }, (err, user) => {
    return cb(err, user);
  });
});

app.name = "API";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://eventy-main-p3zc8qkpv-gonreyna85code.vercel.app"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

mongoose.connect(
  process.env.MONGO,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Mongoose Is Connected");
  }
);

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO,
      ttl: 14 * 24 * 60 * 60, // save session for 14 days
    }),
    resave: false,
    saveUninitialized: true,
    secret: "secretcode",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", user);
app.use("/", event);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT);
});
