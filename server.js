require('dotenv').config();
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");


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



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);
app.use(
  session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),   
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true },

  })
);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true','https://eventy-main.vercel.app' );
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if ('OPTIONS' == req.method) {
       res.send(200);
   } else {
       next();
   }
  });

app.use(cors({
  origin: "https://eventy-main.vercel.app",
  credentials: true,

}))

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.use("/", user);
app.use("/", event);



app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT );
});
