const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/listing");
const BookingLog = require("../models/BookingLog");

// Booking route
router.post("/book/:listingId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send("Login required");
    }

    // Fetch user details from DB
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).send("Listing not found");

    // Create booking log entry
    await BookingLog.create({
      userId: user._id,
      listingId: listing._id,
      userData: {
        name: user.name,
        email: user.email,
        isOwner: user.isOwner,
        isAdmin: user.isAdmin
      },
      listingData: {
        title: listing.title,
        price: listing.price,
        location: listing.location,
        country: listing.country
      },
      bookedAt: new Date()
    });

    res.json({ success: true, message: `Booking logged successfully for ${listing.title}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error logging booking" });
  }
});

module.exports = router;