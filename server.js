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

app.use(
  cors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
    origin: 'https://eventy-main-jsgk72m78-gonreyna85code.vercel.app',
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
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    resave: false,
    saveUninitialized: true,
    secret: 'my-secret'
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
    },
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
