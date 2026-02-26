// middleware/auth.js
const jwt = require("jsonwebtoken");
const Listing = require("../models/listing"); // ✅ import your Listing model

function authMiddleware(req, res, next) {
    const token = req.session.token;
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.redirect("/login");
    }
}

// Middleware: must be logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash("error", "You must be logged in to add a new listing");
  return res.redirect("/auth/login");
}

// router.get("/new", isLoggedIn, (req, res) => {
//   res.render("listings/new");
// });

// function isLoggedIn(req, res, next) {
//   if (!req.isAuthenticated()) {
//     req.flash("error", "You must be logged in to book!");
//     return res.redirect("/auth/login");
//   }
//   next();
// }

// Middleware: must be logged in AND marked as owner

// function isOwnerLoggedIn(req, res, next) {
//   if (!req.isAuthenticated() || req.user.role !== "owner") {
//     req.flash("error", "You must log in as owner to add a listing");
//     return res.redirect("/login");
//   }
//   next();
// }

function isOwner(req, res, next) {
    if (!req.session.user) {
        req.flash("error", "You must be logged in");
        return res.redirect("/auth/login");
    }
    if (!req.session.user.isOwner) {
        req.flash("error", "You must log in as owner to add new listings");
        return res.redirect("/auth/login");
    }
    // Check if listing belongs to current user
    if (req.params.id) {
        Listing.findById(req.params.id)
            .then((listing) => {
                if (!listing){
                    req.flash("error", "Listing not found");
                    return res.redirect("/listings");
                }
                if (listing.owner.toString() !== req.session.user.id) {
                     req.flash("error", "You can only update/delete your own listings");
                    return res.redirect("/listings/show")
                }
                next();
            })
            .catch((err) => {
                req.flash("error", "Error: " + err.message);
                return res.redirect("/listings");
            })
    } else {
        next();
    }
}

function isAdmin(req, res, next) {
  const user = req.session.user;
  if (user && (user.isAdmin || user.isSuperAdmin)) {
    return next();
  }
  req.flash("error", "Admin access required");
  res.redirect("/auth/login");
}

module.exports = { authMiddleware, isLoggedIn, isOwner, isAdmin };
