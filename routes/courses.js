
const express = require("express");
const { Course, User } = require("../models");
const router = express.Router();

// GET /api/v1/courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "description", "price", "slug"],
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: Number(course.price),
    }));

    console.log("Fetched courses:", formattedCourses);
    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();
    courseData.price = Number(courseData.price);
    courseData.lessons = [];
    courseData.unitCount = 0;
    courseData.lessonCount = 0;

    if (!courseData.teacher) {
      courseData.teacher = { id: null, name: "Unknown", email: null };
    }

    res.json({ success: true, ...courseData });
  } catch (err) {
    console.error("Error fetching course by slug:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/:id
router.get("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();
    courseData.price = Number(courseData.price);
    courseData.lessons = [];
    courseData.unitCount = 0;
    courseData.lessonCount = 0;

    if (!courseData.teacher) {
      courseData.teacher = { id: null, name: "Unknown", email: null };
    }

    res.json({ success: true, ...courseData });
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

module.exports = router;
