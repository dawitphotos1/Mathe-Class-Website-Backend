
// const express = require("express");
// const router = express.Router();
// const { Lesson, LessonCompletion } = require("../models"); // ✅ Import LessonCompletion
// const authenticateToken = require("../middleware/authenticateToken"); // ✅ Import auth middleware

// // ✅ Get all lessons in a course
// router.get("/courses/:courseId/lessons", async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     res.json({ success: true, lessons });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

// // ✅ Mark a lesson as completed
// router.post("/:lessonId/complete", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;

//     const [completion, created] = await LessonCompletion.findOrCreate({
//       where: { userId, lessonId },
//     });

//     if (!created) {
//       return res.status(400).json({ message: "Lesson already completed" });
//     }

//     res.json({ success: true, completion });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Get completed lessons for a user in a course
// router.get("/completions", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.query;
//     const userId = req.user.id;

//     const completions = await LessonCompletion.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Lesson,
//           where: { courseId },
//           attributes: ["id", "title"],
//         },
//       ],
//     });

//     const completedLessonIds = completions.map((c) => c.lessonId);
//     res.json({ completedLessonIds });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const { getLessonsByCourseId } = require("../controllers/lessonController");

router.get("/courses/:courseId/lessons", getLessonsByCourseId); // <== This supports frontend path

module.exports = router;

