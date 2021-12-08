require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
const bodyParser = require("body-parser");
const user = require("./routes/user");
const auth = require("./routes/auth");
const event = require("./routes/event");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.name = "API";

app.use(  cors({origin: "https://eventy-main.vercel.app", credentials: true}));

app.set("trust proxy", 1);


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
