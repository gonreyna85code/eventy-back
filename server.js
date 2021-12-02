require('dotenv').config();
const mongoose = require("mongoose");
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
  "mongodb+srv://gonreyna85:gonreyna85@cluster0.bubyh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
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
    store,
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cors({
  origin: "https://eventy-main.vercel.app",
  credentials: true,
   
}));

app.use("/", user);
app.use("/", event);



app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT );
});
