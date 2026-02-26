const mongoose = require("mongoose");

const otpLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true }
});

module.exports = mongoose.model("OtpLog", otpLogSchema);