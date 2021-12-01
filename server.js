const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");


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
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cors({
  origin: true,          
  credentials: true,
}));

app.use('/', user)
app.use('/', event)

const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
  console.log("Server Has Started");
});
