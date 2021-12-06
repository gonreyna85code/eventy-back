require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
//const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
app.name = "API";
require("./passportConfig")(passport);
const jwt = require("jsonwebtoken");


app.use(
  cors()
);

app.set("trust proxy", 1);

app.use(async(req, res, next) => {
  console.log("req.headers", req.headers);
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Origin",
      "https://eventy-main-6hcqxvt4w-gonreyna85code.vercel.app"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, application/x-www-form-urlencoded, Accept, Authorization, Set-Cookie, Cookie"
    );
    return res.status(200).json({});
  }
  
  res.header(
    "Access-Control-Allow-Origin",
    "https://eventy-main-6hcqxvt4w-gonreyna85code.vercel.app"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, application/x-www-form-urlencoded, Accept, Authorization, Set-Cookie, Cookie"
  );
  
  next();
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
mongoose.set("useCreateIndex", true);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser("secretcode"));
app.use(morgan("dev"));

// app.use(
//   session({
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGO,
//       ttl: 14 * 24 * 60 * 60,
//     }),
//     name: "admin_session",
//     expires: new Date(Date.now() + 900000),
//     resave: false,
//     //rolling: false,
//     saveUninitialized: false,
//     //unset: "destroy",
//     secret: "secretcode",
//     cookie: {     
//       //domain: "eventy-main-k6m7r9hk3-gonreyna85code.vercel.app",
//       //expires: new Date(Date.now() + 3600000), 
//       secure: false,
//       httpOnly: true,
//       sameSite: 'none',
//       //maxAge: 14 * 24 * 60 * 60 * 1000,      
//     },
    
//   })
// );

app.use(passport.initialize());


app.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, { session: false }, (err) => {
        if (err) throw err;
        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, "TOP_SECRET");
        console.log(token)
        return res.json({ token })//.send("Successfully Authenticated");        
      });
    }
  })(req, res, next);
});


app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

app.listen(process.env.PORT, () => {
  console.log("Server Has Started on port " + process.env.PORT);
});
