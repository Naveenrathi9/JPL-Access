const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  name: String,
  employeeCode: String,
  designation: String,
  department: String,
  specialAllowance:String,
  item: String,
  reason: String,
  email: String,

  hodEmail: { type: String, required: true },

  status: {
    hr: { type: String, default: "pending" },
    hod: { type: String, default: "pending" },
    ithod: { type: String, default: "pending" },
    it: { type: String, default: "pending" },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
