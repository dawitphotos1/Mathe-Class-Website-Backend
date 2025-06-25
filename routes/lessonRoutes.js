const express = require("express");
const router = express.Router();
const { Lesson } = require("../models");

router.get("/courses/:courseId/lessons", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    res.json({ success: true, lessons }); // ✅ Always return success
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/v1/lessons/:lessonId/complete
router.post("/:lessonId/complete", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const [completion, created] = await LessonCompletion.findOrCreate({
      where: { userId, lessonId },
    });

    if (!created) {
      return res.status(400).json({ message: "Lesson already completed" });
    }

    res.json({ success: true, completion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/v1/lessons/completions?courseId=3
router.get("/completions", authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  const userId = req.user.id;

  const completions = await LessonCompletion.findAll({
    where: { userId },
    include: [
      {
        model: Lesson,
        where: { courseId },
        attributes: ["id", "title"],
      },
    ],
  });

  const completedLessonIds = completions.map((c) => c.lessonId);
  res.json({ completedLessonIds });
});

module.exports = router;
