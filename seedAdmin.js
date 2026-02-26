const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB connected");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env");
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists, skipping seeding.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new Admin({
      name: "IamGroot",
      email,
      password: hashedPassword,
      isOwner: true,
      isVerified: true,
      isSuperAdmin: true
    });

    await adminUser.save();
    console.log("✅ Admin user created in 'admins' collection");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();