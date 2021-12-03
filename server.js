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

//app.enable('trust proxy')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("secretcode"));
app.use(
  cors({
    origin: "https://eventy-main-jsgk72m78-gonreyna85code.vercel.app",
    credentials: true,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  })
);


app.set('trust proxy', 1);
app.use(
  session({
    name: "SESS_NAME",
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    secret: "secretcode",
    withCredentials: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
      //domain: "https://eventy-main-jsgk72m78-gonreyna85code.vercel.app",
      sameSite: true,
      maxAge: 100000,
      secure: false,
      originalMaxAge: 100000,
      httpOnly: true,
    },
    path: 'sessions',
  })
);   

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.use("/", user);
app.use("/", event);

app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT);
});
