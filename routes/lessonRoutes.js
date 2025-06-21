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

module.exports = router;
