
// const express = require("express");
// const router = express.Router();
// const { LessonProgress } = require("../models");
// const auth = require("../middleware/authMiddleware");

// router.post("/complete", auth, async (req, res) => {
//   const { lessonId } = req.body;
//   const userId = req.user.id;

//   const progress = await LessonProgress.upsert({
//     userId,
//     lessonId,
//     completed: true,
//   });

//   res.json({ success: true, message: "Lesson marked complete" });
// });

// router.get("/:userId", auth, async (req, res) => {
//   const progress = await LessonProgress.findAll({
//     where: { userId: req.params.userId },
//   });
//   res.json({ success: true, progress });
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const { LessonProgress } = require("../models");
const auth = require("../middleware/authMiddleware");

// Force CORS headers on all responses from this router
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
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
    console.error("Error marking lesson complete:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
router.get("/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

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
