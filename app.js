const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const listingsRoutes = require("./routes/listings");
const uploadRoutes = require("./routes/upload");
const adminRoutes = require("./routes/admin");
const bookingsRouter = require("./routes/booking");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ✅ Connect to MongoDB first
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    // ✅ Only start server after DB connection
    app.listen(8080, () => {
      console.log("Server is listening on port 8080");
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

main();

// ------------------- Express setup -------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(session({
  secret: process.env.SESSION_SECRET || "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set secure: true if using HTTPS
}));

// ✅ Flash + session locals
app.use(flash());
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.user || null;
  next();
});

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/listings", listingsRoutes);
app.use("/files", uploadRoutes);
app.use("/admin", adminRoutes);
app.use("/bookings", bookingsRouter);

app.get("/", (req, res) => {
  res.render("auth");
});

// Auth route
app.get("/auth", (req, res) => {
  res.render("auth"); // renders views/auth.ejs
});

// app.use((req, res, next) => {
//   res.locals.isOwner = req.session.isOwner || false;
//   next();
// });

// app.post("/auth/login", (req, res) => {
//   const { email, password, isOwner } = req.body;
//   // validate user...
//   req.session.isOwner = isOwner === "true"; // must be boolean true/false
//   res.redirect("/listings");
// });


app.get("/healthz", (req, res) => res.send("OK"));

// ✅ Error handler
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Occurred" } = err;
  res.status(status).send(message);
});