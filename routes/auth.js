const express = require("express");
const sendEmail = require("../utils/mailer");
// const sendSMS = require("../utils/sms");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const Admin = require("../models/Admin");
const OtpLog = require("../models/OtpLog");
// const BookingLog = require("../models/BookingLog");


// Render login page
router.get("/login", (req, res) => {
  res.render("auth", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

// Render Signup page

router.get("/signup", (req, res) => {
  res.render("auth", {
    error: req.flash("error"),
    success: req.flash("success")
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("token");
    res.redirect("/listings");
  });
});

// // Render OTP verification page
// router.get("/verify", (req, res) => {
//   res.render("verify", {
//     error: req.flash("error"),
//     success: req.flash("success")
//   });
// });

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await OtpLog.findOneAndUpdate(
      { email },
      { otp, otpExpires: Date.now() + 10 * 60 * 1000 },
      { upsert: true, new: true }
    );

    await sendEmail(email, "Verify Your Email In WanderLust.", `Welcome aboard! 🎉
      Your email verification code is ${otp}.
      Use it within 10 minutes to activate your account.`);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});


// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OtpLog.findOne({ email });

    if (!record) return res.status(400).json({ success: false, message: "No OTP found" });
    if (record.otp !== otp || Date.now() > record.otpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await OtpLog.deleteOne({ email }); // OTP verified → delete record

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});



// Signup AFTER OTP verified
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, isOwner } = req.body;
    const ownerFlag = Boolean(isOwner);

    // Ensure OTP was verified (no record left in OtpLog)
    const otpRecord = await OtpLog.findOne({ email });
    if (otpRecord) {
      req.flash("error", "Please verify your email with OTP first");
      return res.redirect("/auth/signup");
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/auth/login");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update user record
    user = new User({
      name,
      email,
      password: hashedPassword,
      isOwner: ownerFlag,
      isVerified: true
    });

    await user.save(); // ✅ User schema updated here

    req.flash("success", "Signup completed successfully! Please log in.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error: " + err.message);
    res.redirect("/auth/signup");
  }
});


// // Verify OTP (email only)
// router.post("/verify", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       req.flash("error", "User not found");
//       return res.redirect("/auth/verify");
//     }

//     if (user.otp !== otp || Date.now() > user.otpExpires) {
//       req.flash("error", "Invalid or expired OTP");
//       return res.redirect("/auth/verify");
//     }

//     user.isVerified = true;
//     user.otp = null;
//     await user.save();

//     req.flash("success", "Account verified successfully! Please log in.");
//     res.redirect("/auth/login");
//   } catch (err) {
//     console.error(err);
//     req.flash("error", "Error: " + err.message);
//     res.redirect("/auth/verify");
//   }
// });

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, isOwner } = req.body;
    const ownerFlag = Boolean(isOwner);

    // First check User collection
    let account = await User.findOne({ email });

    // If not found, check Admin collection
    if (!account) {
      account = await Admin.findOne({ email });
    }

    if (!account) {
      req.flash("error", "Account not found");
      return res.redirect("/auth/login");
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/auth/login");
    }

    if (ownerFlag && !account.isOwner) {
      req.flash("error", "You must be registered as an owner to log in with owner privileges");
      return res.redirect("/auth/login");
    }

    req.session.user = {
      id: account._id.toString(),
      name: account.name,
      isOwner: ownerFlag,
      isAdmin: account.isAdmin || account.isSuperAdmin || false
    };

    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error: " + err.message);
    res.redirect("/auth/login");
  }
});

// // Booking route
// router.post("/book/:listingId", async (req, res) => {
//   if (!req.session.user) return res.status(401).send("Login required");

//   const user = await User.findById(req.session.user.id);
//   if (!user) return res.status(404).send("User not found");

//   await BookingLog.create({
//     userId: user._id,
//     userData: {
//       name: user.name,
//       email: user.email,
//       isOwner: user.isOwner,
//       isAdmin: user.isAdmin
//     },
//     listingId: req.params.listingId,
//     bookedAt: new Date()
//   });

//   res.send("Booking logged successfully");
// });

module.exports = router;
