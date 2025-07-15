
// routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Upload endpoint
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.error("❌ File upload failed: No file in request");
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

module.exports = router;
