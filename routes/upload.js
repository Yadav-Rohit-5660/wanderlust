const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary");

router.post("/upload", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

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

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;