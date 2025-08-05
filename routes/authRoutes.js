// // routes/authRoutes.js

// const express = require("express");
// const router = express.Router();
// const { register } = require("../controllers/authController");

// // POST /api/v1/auth/register
// router.post("/register", register);

// // You can add login, logout, etc. here in future
// // router.post("/login", login);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
