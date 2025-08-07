// const express = require("express");
// const router = express.Router();
// const authenticate = require("../middleware/authenticate");

// router.get("/me", authenticate, async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   res.json({ user: req.user });
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

router.get("/me", authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ user: req.user });
});

module.exports = router;
