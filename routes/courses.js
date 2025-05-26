const express = require("express");
const { Course, Teacher } = require("../models");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "description", "price"],
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
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

router.get("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    if (!course) {
      console.log(`Course not found for ID: ${courseId}`);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const courseData = course.toJSON();
    // Placeholder for lessons
    courseData.lessons = [];
    courseData.unitCount = 0;
    courseData.lessonCount = 0;

    if (!courseData.teacher) {
      console.warn(`Teacher not found for course ID: ${courseId}`);
      courseData.teacher = { id: null, name: "Unknown", email: null };
    }

    console.log("Fetched course:", courseData);
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
