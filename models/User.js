const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true }, // optional
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
  isAdmin: {type: Boolean, default: false }
}, { timestamps: true });

// const bookingLogSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
//   clickedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("BookingLog", bookingLogSchema);

module.exports = mongoose.model("User", userSchema);