const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    set: (v) => {
      // ✅ If empty string, fallback to default
      if (!v || v === "") {
        return "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";
      }
      return v;
    }
  },
  price: Number,
  location: String,
  country: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);