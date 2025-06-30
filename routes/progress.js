
// const express = require("express");
// const router = express.Router();
// const { LessonProgress } = require("../models");
// const auth = require("../middleware/authMiddleware");

// // ✅ Force CORS headers on every response
// router.use((req, res, next) => {
//   const origin = req.headers.origin;
//   res.setHeader("Access-Control-Allow-Origin", origin || "*");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });

// router.post("/complete", auth, async (req, res) => {
//   try {
//     const { lessonId } = req.body;
//     const userId = req.user.id;

//     if (!lessonId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing lessonId" });
//     }

//     await LessonProgress.upsert({
//       userId,
//       lessonId,
//       completed: true,
//     });

//     res.json({ success: true, message: "Lesson marked complete" });
//   } catch (error) {
//     console.error(
//       "❌ Error marking lesson complete:",
//       error.stack || error.message
//     );
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// router.post("/incomplete", auth, async (req, res) => {
//   try {
//     const { lessonId } = req.body;
//     const userId = req.user.id;

//     if (!lessonId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing lessonId" });
//     }

//     await LessonProgress.upsert({
//       userId,
//       lessonId,
//       completed: false,
//     });

//     res.json({ success: true, message: "Lesson marked as incomplete" });
//   } catch (error) {
//     console.error(
//       "❌ Error marking lesson incomplete:",
//       error.stack || error.message
//     );
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// });

// router.get("/:userId", auth, async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log("🔍 Fetching progress for userId:", userId);

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing userId param" });
//     }

//     const progress = await LessonProgress.findAll({
//       where: { userId },
//     });

//     res.json({ success: true, progress });
//   } catch (err) {
//     console.error(
//       "❌ Error in GET /progress/:userId:",
//       err.stack || err.message
//     );
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to load progress data" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const { LessonProgress, Lesson } = require("../models");
const auth = require("../middleware/auth");
const { User } = require("../models");
// POST /api/v1/progress/complete
router.post("/complete", auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    // Check if it already exists
    const existing = await LessonProgress.findOne({
      where: { userId, lessonId },
    });

    if (existing) {
      if (existing.completed) {
        return res
          .status(200)
          .json({ success: true, message: "Already completed" });
      }
      existing.completed = true;
      await existing.save();
    } else {
      await LessonProgress.create({ userId, lessonId, completed: true });
    }

    res.json({ success: true, message: "Lesson marked as complete" });
  } catch (err) {
    console.error("Error marking complete:", err);
    res.status(500).json({ error: "Failed to mark lesson complete" });
  }
});

// GET /api/v1/progress/:courseId
router.get("/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all lessons in the course
    const lessons = await Lesson.findAll({ where: { courseId } });

    const lessonIds = lessons.map((l) => l.id);

    // Get completed lessonIds for this user
    const completed = await LessonProgress.findAll({
      where: {
        userId,
        lessonId: lessonIds,
        completed: true,
      },
      attributes: ["lessonId"],
    });

    const completedLessonIds = completed.map((entry) => entry.lessonId);

    res.json({ success: true, completedLessonIds });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});
// GET /api/v1/progress/course/:courseId/user/:userId (admin only)
router.get("/course/:courseId/user/:userId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { courseId, userId } = req.params;

    const lessons = await Lesson.findAll({ where: { courseId } });
    const lessonIds = lessons.map((l) => l.id);

    const completed = await LessonProgress.findAll({
      where: {
        userId,
        lessonId: lessonIds,
        completed: true,
      },
    });

    const completedLessonIds = completed.map((c) => c.lessonId);

    res.json({
      success: true,
      studentId: userId,
      courseId,
      totalLessons: lessons.length,
      completedLessons: completedLessonIds.length,
      percentage: ((completedLessonIds.length / lessons.length) * 100).toFixed(1),
      completedLessonIds,
    });
  } catch (err) {
    console.error("Admin progress fetch error:", err);
    res.status(500).json({ error: "Failed to get user progress" });
  }
});

module.exports = router;
