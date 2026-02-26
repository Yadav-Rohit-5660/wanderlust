const multer = require("multer");

// Configure Multer with memory storage, file size limit, and file filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // enforce 10 MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

module.exports = upload;