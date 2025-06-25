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


const { Lesson, Course } = require("../models");

exports.getLessonsByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    return res.status(200).json({ lessons });
  } catch (err) {
    console.error("❌ Error fetching lessons:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching lessons" });
  }
};
