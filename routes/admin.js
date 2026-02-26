const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const BookingLog = require("../models/BookingLog");


// Admin dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    const owners = await User.find({ isOwner: true });

    // Use snapshots from BookingLog instead of populate
    const bookings = await BookingLog.find({});

    res.render("admin/dashboard", { users, owners, bookings });
  } catch (err) {
    req.flash("error", "Error loading dashboard: " + err.message);
    res.redirect("/listings");
  }
});

module.exports = router;