require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
app.name = "API";
require("./passportConfig")(passport);


app.use(cors({
  preflightContinue: true,
  credentials: true,
  origin: true,
}));

app.use((req, res, next) => {
  if(req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Origin", 'https://eventy-main-d2b1h4ai4-gonreyna85code.vercel.app');
    res.header("Access-Control-Allow-Headers", "Content-Type, application/json" );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header();
    res.header("Access-Control-Allow-Credentials", true);    
    res.sendStatus(200);
  } else {
    next();
  }
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
      ttl: 14 * 24 * 60 * 60,
    }),
    resave: false,
    saveUninitialized: true,
    secret: "secretcode",
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
