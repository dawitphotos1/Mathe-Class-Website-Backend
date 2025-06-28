
const express = require("express");
const router = express.Router();
const { LessonProgress } = require("../models");
const auth = require("../middleware/authMiddleware");

// ✅ Force CORS headers on every response
router.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

router.post("/complete", auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing lessonId" });
    }

    await LessonProgress.upsert({
      userId,
      lessonId,
      completed: true,
    });

    res.json({ success: true, message: "Lesson marked complete" });
  } catch (error) {
    console.error(
      "❌ Error marking lesson complete:",
      error.stack || error.message
    );
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/incomplete", auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing lessonId" });
    }

    await LessonProgress.upsert({
      userId,
      lessonId,
      completed: false,
    });

    res.json({ success: true, message: "Lesson marked as incomplete" });
  } catch (error) {
    console.error(
      "❌ Error marking lesson incomplete:",
      error.stack || error.message
    );
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("🔍 Fetching progress for userId:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing userId param" });
    }

    const progress = await LessonProgress.findAll({
      where: { userId },
    });

    res.json({ success: true, progress });
  } catch (err) {
    console.error(
      "❌ Error in GET /progress/:userId:",
      err.stack || err.message
    );
    res
      .status(500)
      .json({ success: false, error: "Failed to load progress data" });
  }
});

module.exports = router;
