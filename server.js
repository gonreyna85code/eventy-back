require("dotenv").config();
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
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

app.enable('trust proxy')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://eventy-main-jsgk72m78-gonreyna85code.vercel.app",
    credentials: true,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  })
);


app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);
app.use(
  session({
    name: "SESS_NAME",
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    secret: "secretcode",
    withCredentials: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      //domain: "gonzalo-eventy3.herokuapp.com",
      sameSite: 'none',
      maxAge: 1000,
      secure: true,
      httpOnly: false,
    },
  })
);   

app.use("/", user);
app.use("/", event);

app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT);
});
