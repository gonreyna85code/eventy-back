require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const MongoStore = require("connect-mongo");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");

app.name='API'

app.use(cors());
app.use(
  cors({
    credentials: true,
    preflightContinue: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
    origin: true,
  })
);

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

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());



app.use(
  session({
    secret: "secretcode",
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    }
  })
);   

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

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
