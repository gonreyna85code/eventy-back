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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://eventy-main-9w857qt5i-gonreyna85code.vercel.app",
    //methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    //preflightContinue: false,
    //optionsSuccessStatus: 204,
    //allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);


//app.use(cookieParser("secretcode"));
//app.use(passport.initialize());
//app.use(passport.session());
//require("./passportConfig")(passport);
app.use(
  session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);   


app.use("/", user);
app.use("/", event);

app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT);
});
