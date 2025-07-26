
// const multer = require("multer");

// // Set up storage in memory to avoid Render filesystem issues
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === "application/pdf") {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF files are allowed"), false);
//     }
//   },
// });

// module.exports = upload;


// middleware/uploadMiddleware.js
const multer = require("multer");

// ✅ Use memory storage so we can write manually to disk later
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // optional: limit file size to 25MB
  },
  fileFilter: (req, file, cb) => {
    // ✅ Optional: restrict allowed file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/webm",
      "image/jpeg",
      "image/png",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

module.exports = upload;
