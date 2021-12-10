require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
var session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
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

app.use(cors({ origin: "https://eventy-main.vercel.app", credentials: true }));

app.set("trust proxy", 1);

app.get("/", (req, res, next) => {
  headers["Access-Control-Allow-Origin"] = "https://eventy-main.vercel.app";
  headers["Access-Control-Allow-Headers"] =
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With";
  headers["Access-Contrl-Allow-Methods"] = "PUT, POST, GET, DELETE, OPTIONS";
  headers["Access-Control-Max-Age"] = "86400";
  res.writeHead(200, headers);
  if (req.method === "OPTIONS") {
    console.log("OPTIONS SUCCESS");
    res.end();
  }
});

mongoose.connect(
  process.env.MONGO,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Mongoose Is Connected");
  }
);
mongoose.set("useCreateIndex", true);

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  session({
    secret: "secretcode",
    resave: false,
    path: "/",
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO }),
    cookie: {
      domain: "eventy-main.vercel.app",
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000 * 24 * 365,
    },
  })
);

require("./passportConfig")(passport);
app.use(passport.initialize());
app.use(passport.session());

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
