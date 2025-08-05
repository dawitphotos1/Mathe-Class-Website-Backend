
// // routes/auth.js
// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// // Register new user
// router.post("/register", authController.register);

// // Login
// router.post("/login", authController.login);

// // Forgot Password
// router.post("/forgot-password", authController.forgotPassword);

// module.exports = router;



const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

module.exports = router;
