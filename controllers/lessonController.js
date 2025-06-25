// controllers/lessonController.js

const { Lesson } = require("../models");

exports.getLessonsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    res.json({ lessons });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};
