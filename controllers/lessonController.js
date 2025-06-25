// // controllers/lessonController.js

// const { Lesson } = require("../models");

// exports.getLessonsByCourse = async (req, res) => {
//   const { courseId } = req.params;

//   try {
//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     res.json({ lessons });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({ error: "Failed to fetch lessons" });
//   }
// };


const { Lesson } = require("../models");

exports.getLessonsByCourseId = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ lessons });
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Server error loading lessons" });
  }
};

