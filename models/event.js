const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const event = new mongoose.Schema({
  name: String,
  location: Object,
  category: { type: Schema.Types.String, ref: "User" },
  subcategory: { type: Schema.Types.String, ref: "User" },
  event_pay: Boolean,
  date: String,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  info: Object,
});

module.exports = mongoose.model("Event", event);