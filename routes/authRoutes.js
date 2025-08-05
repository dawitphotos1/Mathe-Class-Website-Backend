// const express = require("express");
// const router = express.Router();

// // Import the full controller object
// const authController = require("../controllers/authController");

// // Use methods from the controller
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// module.exports = router;


// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register); // ✅ Correct usage

module.exports = router;
