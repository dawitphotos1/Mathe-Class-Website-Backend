
// const express = require("express");
// const router = express.Router();
// const { UserCourseAccess } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");

// // GET /api/v1/progress
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Fetch enrolled courses for this user (no broken include!)
//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId },
//     });

//     let completedLessons = 0;
//     let totalLessons = 0;
//     let currentCourse = null;

//     // NOTE: Replace this logic with actual lesson tracking when ready
//     for (const enrollment of enrollments) {
//       const courseId = enrollment.courseId;

//       // Placeholder: simulate total and completed lessons
//       const courseLessons = []; // You can later fetch lessons using Course.findAll({ where: { courseId } })

//       totalLessons += courseLessons.length;
//       completedLessons += courseLessons.length;

//       if (!currentCourse && courseLessons.length > 0) {
//         currentCourse = courseId;
//       }
//     }

//     const completionPercentage = totalLessons
//       ? Math.round((completedLessons / totalLessons) * 100)
//       : 0;

//     res.json({
//       completedLessons: completedLessons || 0,
//       currentCourse: currentCourse || "No active course",
//       completionPercentage: completionPercentage || 0,
//     });
//   } catch (err) {
//     console.error("Progress fetch error:", err);
//     res.status(500).json({ error: "Failed to fetch progress" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { LessonProgress } = require("../models");
const auth = require("../middleware/authMiddleware");

router.post("/complete", auth, async (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user.id;

  const progress = await LessonProgress.upsert({
    userId,
    lessonId,
    completed: true,
  });

  res.json({ success: true, message: "Lesson marked complete" });
});

router.get("/:userId", auth, async (req, res) => {
  const progress = await LessonProgress.findAll({
    where: { userId: req.params.userId },
  });
  res.json({ success: true, progress });
});

module.exports = router;
