const mongoose = require("mongoose");

const bookingLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userData: {
    name: String,
    email: String,
    isOwner: Boolean,
    isAdmin: Boolean
  },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    // Snapshot of listing data
  listingData: {
    title: String,
    price: Number,
    location: String,
    country: String
  },
bookedAt: {
  type: String,
  default: () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
}
});

module.exports = mongoose.model("BookingLog", bookingLogSchema);