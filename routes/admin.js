// // routes/admin.js
// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// const authenticate = require("../middleware/authenticate");
// const authorize = require("../middleware/authorize");
// const authorizeRoles = require("../middleware/roleMiddleware");

// // Only allow logged-in admins
// router.use(authenticate);
// router.use(authorizeRoles(["admin", "teacher"]));

// // ✅ Student approval
// router.get("/pending-users", adminController.getPendingUsers);
// router.patch("/approve-user/:id", adminController.approveUser);
// router.patch("/reject-user/:id", adminController.rejectUser);

// module.exports = router;




// ✅ routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(authenticate);
router.use(authorizeRoles(["admin", "teacher"]));

router.get("/pending-users", adminController.getPendingUsers);
router.patch("/approve-user/:id", adminController.approveUser);
router.patch("/reject-user/:id", adminController.rejectUser);

module.exports = router;
