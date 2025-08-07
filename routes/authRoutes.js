// // routes/authRoutes.js
// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// router.post("/register", authController.register);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);

module.exports = router;
