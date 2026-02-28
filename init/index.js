const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config(); // load .env variables

// Use Atlas connection string from .env
const MONGO_URL = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("✅ Data was initialized");
  } catch (err) {
    console.error("❌ Error initializing data:", err);
  }
};

main().then(() => initDB());