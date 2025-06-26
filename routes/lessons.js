

// const express = require("express");
// const router = express.Router();

// const lessonController = require("../controllers/lessonController");
// const authenticate = require("../middleware/authenticate");

// // GET /api/v1/lessons/courses/:courseId/lessons
// router.get("/courses/:courseId/lessons", authenticate, lessonController.getLessonsByCourse);

// module.exports = router;




// routes/lessons.js
const express = require("express");
const router = express.Router();
const { Lesson } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:courseId/lessons", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      content,
      contentType,
      contentUrl,
      videoUrl,
      orderIndex,
      isUnitHeader,
      isPreview,
      unitId
    } = req.body;

    const newLesson = await Lesson.create({
      courseId: parseInt(courseId),
      title,
      content,
      contentType,
      contentUrl,
      videoUrl,
      orderIndex,
      isUnitHeader,
      isPreview,
      unitId: unitId || null,
      userId: req.user.id
    });

    res.status(201).json({ success: true, lesson: newLesson });
  } catch (err) {
    console.error("Lesson creation error:", err);
    res.status(500).json({ success: false, error: "Failed to create lesson" });
  }
});

module.exports = router;
