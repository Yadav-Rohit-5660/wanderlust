const express = require("express");
const router = express.Router();
const Listing = require("../models/listing"); // import your model
const authMiddleware = require("../middleware/auth");
const { isLoggedIn, isOwner, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary");


// Create listing (only logged in Owners)
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).send("Upload error: " + err.message);
    }
    next();
  });
}, isOwner, async (req, res) => {
  try {
    let imagePath = req.body.listing.image; // fallback if user pasted a link

    if (req.file) {
      const compressedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200 })
        .jpeg({ quality: 80 })
        .toBuffer();

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "wanderlust_uploads" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(compressedBuffer);
      });

      imagePath = result.secure_url;
    }

    const newListing = new Listing({
      ...req.body.listing,
      owner: req.session.user.id,
      image: imagePath
    });

    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
});



// INDEX – show all listings
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

router.get("/admin/dashboard", isAdmin, async (req, res) => {
  const users = await User.find({});
  const bookings = await BookingLog.find({}).populate("userId listingId");

  res.render("adminDashboard", { users, bookings });
});


// New Route (only owners can access)
router.get("/new",isLoggedIn, isOwner, (req, res) => {
  res.render("listings/new");
});


// SHOW – single listing
router.get("/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  if (!listing) return res.status(404).send("Listing not found");

  res.render("listings/show", { listing, session: req.session });
});

// EDIT – form to edit
router.get("/:id/edit", async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/edit", { listing });
});

// Update listing (owner OR admin)
router.put("/:id", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  if (!listing) return res.status(404).send("Listing not found");

  const isOwner = listing.owner && listing.owner._id.toString() === req.session.user.id;
  const isAdmin = req.session.user && req.session.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return res.status(403).send("You can only update your own listings unless you are an admin");
  }

  await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing });
  res.redirect(`/listings/${req.params.id}`);
});

// Delete listing (owner OR admin)
router.delete("/:id", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  if (!listing) return res.status(404).send("Listing not found");

  const isOwner = listing.owner && listing.owner._id.toString() === req.session.user.id;
  const isAdmin = req.session.user && req.session.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return res.status(403).send("You can only delete your own listings unless you are an admin");
  }

  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
});


module.exports = router;