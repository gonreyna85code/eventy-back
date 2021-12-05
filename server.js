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
const MongoStore = require("connect-mongo");
app.name = "API";


app.use(cors({
	origin: "https://eventy-main-pmbecp9ib-gonreyna85code.vercel.app",
  credentials: true,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	preflightContinue: false,
	optionsSuccessStatus: 204
}));

// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') {
//     console.log('!OPTIONS');
//     var headers = {};
//     headers["Access-Control-Allow-Origin"] = "https://eventy-main-qmbuke3o4-gonreyna85code.vercel.app";
//     headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
//     headers["Access-Control-Allow-Credentials"] = true;
//     headers["Access-Control-Max-Age"] = '86400'; // 24 hours
//     headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
//     res.writeHead(200, headers);
//     res.end();
//   } else {
//     next();
//   }
// });
  

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
app.use(cookieParser("secretcode"));

app.set("trust proxy", 1);

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO,
      ttl: 14 * 24 * 60 * 60, // save session for 14 days
      
    }),
    resave: false,
    saveUninitialized: true,
    secret: "secretcode",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,    
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
