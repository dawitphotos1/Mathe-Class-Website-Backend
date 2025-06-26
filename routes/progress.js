
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
