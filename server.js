require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const app = express();
const user = require("./routes/user");
const event = require("./routes/event");
const cors = require("cors");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
app.name = "API";

const jwt = require("jsonwebtoken");
const session = require("express-session-jwt");


app.use(
  cors({
    origin: "https://eventy-main-dtzsgk3om-gonreyna85code.vercel.app",
    credentials: true

  })
);

app.set("trust proxy", 1);

app.use(async (req, res, next) => {
  console.log("req.headers", req.headers);
  console.log("req.cookies", req.cookies);
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Origin",
      "https://eventy-main-dtzsgk3om-gonreyna85code.vercel.app"
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
    "https://eventy-main-dtzsgk3om-gonreyna85code.vercel.app"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, application/x-www-form-urlencoded, Cookie, Accept, Authorization, Set-Cookie"
  );
//set.cookie("Access-Control-Allow-Origin", "https://eventy-main-6hcqxvt4w-gonreyna85code.vercel.app");
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


app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

const store = MongoStore.create({
  mongoUrl: process.env.MONGO,
  ttl: 14 * 24 * 60 * 60,
});

app.use(
  session({
    name:session.name,
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
    store: store,
    keys: {
      public:
        "-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEDXMuNS4pyqkpZwij+UCcTPVStZHmG39D\nP1V7qaPCfc0ewXXbcEaJiarqjHOM5a6SVivCaUdJj+25tjMk4sPchQ==\n-----END PUBLIC KEY-----",
      private:
        "-----BEGIN PRIVATE KEY-----\nMIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgvK1dk5M81nax8lQxpbWo\nsB1oK9YAqRP7MwWc7wDne8ehRANCAAQNcy41LinKqSlnCKP5QJxM9VK1keYbf0M/\nVXupo8J9zR7BddtwRomJquqMc4zlrpJWK8JpR0mP7bm2MyTiw9yF\n-----END PRIVATE KEY-----",
    },
    cookie: {
      //domain: "https://eventy-main-6hcqxvt4w-gonreyna85code.vercel.app",
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 14,
      sameSite: "none",
    },
  })
);

require("./passportConfig")(passport);
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
        console.log(token);
        return res.json({ token }); //.send("Successfully Authenticated");
      });
    }
  })(req, res, next);
});

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
