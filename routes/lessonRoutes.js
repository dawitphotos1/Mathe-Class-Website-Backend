// // const express = require("express");
// // const router = express.Router();
// // const { Lesson } = require("../models");

// // // GET /api/v1/courses/:courseId/lessons
// // router.get("/courses/:courseId/lessons", async (req, res) => {
// //   try {
// //     const courseId = req.params.courseId;
// //     const lessons = await Lesson.findAll({
// //       where: { courseId },
// //       order: [["orderIndex", "ASC"]],
// //     });

// //     if (!lessons.length) {
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "No lessons found." });
// //     }

// //     res.json({ success: true, lessons });
// //   } catch (err) {
// //     console.error("Error fetching lessons:", err);
// //     res.status(500).json({ success: false, message: "Server error." });
// //   }
// // });

// // module.exports = router;






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

    if (!lessons.length) {
      return res
        .status(404)
        .json({ success: false, message: "No lessons found." });
    }

    res.json({ success: true, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
