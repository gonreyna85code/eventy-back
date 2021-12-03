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
    
  })
);


app.set('trust proxy', 1);
app.use(
  session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    secret: "secretcode",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: false, secure: false },
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
