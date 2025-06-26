const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const uploadDir = path.join(__dirname, "../uploads");

router.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to list files" });
    res.json({ success: true, files });
  });
});

router.delete("/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete file" });
    res.json({ success: true, message: "File deleted" });
  });
});

module.exports = router;
