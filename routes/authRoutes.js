
// const express = require("express");
// const router = express.Router();
// const { register, login } = require("../controllers/authController");

// router.post("/register", register);
// router.post("/login", login);

// module.exports = router;

const express = require("express");
const router = express.Router();

// Import the full controller object
const authController = require("../controllers/authController");

// Use methods from the controller
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
