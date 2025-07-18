// const express = require("express");
// const router = express.Router();
// const { Course, Lesson, User } = require("../server");
// const authenticate = require("../middleware/authenticate");

// router.get("/", authenticate, async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
//     });
//     res.status(200).json(courses);
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     res.status(500).json({ error: "Failed to fetch courses" });
//   }
// });

// router.delete("/:id", authenticate, async (req, res) => {
//   try {
//     const course = await Course.findByPk(req.params.id);
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }
//     if (course.teacherId !== req.user.id) {
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     await Lesson.destroy({ where: { courseId: req.params.id } });
//     await course.destroy();
//     res.status(200).json({ message: "Course deleted" });
//   } catch (err) {
//     console.error("Error deleting course:", err);
//     res.status(500).json({ error: "Failed to delete course" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const { Course, User, Lesson } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
    });
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await Lesson.destroy({ where: { courseId: req.params.id } });
    await course.destroy();
    res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

module.exports = router;