require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const user = require("./routes/user");
const auth = require("./routes/auth");
const event = require("./routes/event");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.name = "API";

app.use(  cors({origin: "https://eventy-main.vercel.app", credentials: true, preflightContinue: false}));

app.set("trust proxy", 1);

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "https://eventy-main.vercel.app");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, application/x-www-form-urlencoded, Accept, Authorization, Set-Cookie, Cookie");
    return res.status(200).json({});

  }
  
  res.header("Access-Control-Allow-Origin", "https://eventy-main.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, application/x-www-form-urlencoded, Cookie, Accept, Authorization, Set-Cookie");
  next();
});

mongoose.connect(
  process.env.MONGO,{useNewUrlParser: true,useUnifiedTopology: true},
  () => {console.log("Mongoose Is Connected");});
mongoose.set("useCreateIndex", true);

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("dev"));

require("./passportConfig")(passport);
app.use(passport.initialize());


app.use("/", auth);
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
