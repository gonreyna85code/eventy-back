const mongoose = require("mongoose");


const user =  mongoose.Schema({  
  username: String,
  password: String,
  profile: Object,
  email: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  follows: [{type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  near: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  subscriptions: [{ type: mongoose.Schema.Types.String, ref: "Event" }],
});

module.exports = mongoose.model("User", user);
