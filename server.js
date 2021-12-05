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
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
app.name = "API";
require("./passportConfig")(passport);

app.use(
  cors({
    origin: true, //se habilitan las credenciales de cors para los pedidos que vengan del front
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Origin",
      "https://eventy-main-k6m7r9hk3-gonreyna85code.vercel.app"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookie"
    );
    return res.status(200).json({});
  }

  res.header(
    "Access-Control-Allow-Origin",
    "https://eventy-main-k6m7r9hk3-gonreyna85code.vercel.app"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, x-www-form-urlencoded, Accept, application/json, Authorization, application/json"
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

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
//app.use(cookieParser("secretcode"));
app.use(morgan("dev"));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO,
      ttl: 14 * 24 * 60 * 60,
    }),
    name: "admin_session",
    expires: new Date(Date.now() + 900000),
    resave: true,
    //rolling: false,
    saveUninitialized: false,
    //unset: "destroy",
    secret: "secretcode",
    cookie: {     
      domain: "eventy-main-k6m7r9hk3-gonreyna85code.vercel.app",
      expires: new Date(Date.now() + 3600000), 
      //secure: true,
      httpOnly: false,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000,      
    },
    
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
