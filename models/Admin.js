const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  createdAtIST: {
    type: String,
    default: () =>
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })
    }
});

// ✅ This will create an "admins" collection
module.exports = mongoose.model("Admin", adminSchema);