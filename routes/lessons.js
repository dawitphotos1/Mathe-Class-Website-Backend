// // routes/lessons.js

// const express = require("express");
// const router = express.Router();
// const lessonController = require("../controllers/lessonController");
// const authenticate = require("../middleware/authenticate"); // If using JWT auth

// router.get(
//   "/courses/:courseId/lessons",
//   authenticate,
//   lessonController.getLessonsByCourse
// );

// module.exports = router;



// routes/lessons.js

const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lessonController");
const authenticate = require("../middleware/authenticate");

// GET /api/v1/lessons/courses/:courseId/lessons
router.get("/courses/:courseId/lessons", authenticate, lessonController.getLessonsByCourse);

module.exports = router;

