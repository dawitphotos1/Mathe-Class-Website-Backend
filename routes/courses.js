const express = require("express");
const { Course, User, Lesson } = require("../models");
const router = express.Router();
const fs = require("fs");
const path = require("path");

function appendToLogFile(message) {
  const logDir = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logDir, "courses.log");
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, `${message}\n`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

// GET /api/v1/courses — list all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "description", "price", "slug"],
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || "No description available",
      price: Number(course.price),
    }));

    appendToLogFile(`[SUCCESS] ${new Date().toISOString()} - Fetched ${courses.length} courses`);
    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    appendToLogFile(`[ERROR] ${new Date().toISOString()} - Fetch all courses: ${err.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/slug/:slug — fetch course by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Missing slug parameter`);
      return res.status(400).json({ success: false, error: "Missing slug parameter" });
    }

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email", "profileImage"],
          required: false,
        },
        {
          model: Lesson,
          as: "lessons",
          attributes: [
            "id",
            "title",
            "content",
            "contentType",
            "contentUrl",
            "videoUrl",
            "isUnitHeader",
            "unitId",
            "orderIndex",
          ],
          order: [["orderIndex", "ASC"]],
          required: false,
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "orderIndex", "ASC"]],
    });

    if (!course) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Course not found for slug: ${slug}`);
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();

    // Group lessons into units
    const lessons = courseData.lessons || [];
    const units = [];
    const unitMap = {};

    for (const lesson of lessons) {
      if (lesson.isUnitHeader) {
        unitMap[lesson.id] = {
          unitName: lesson.title,
          lessons: [],
        };
        units.push(unitMap[lesson.id]);
      } else if (lesson.unitId && unitMap[lesson.unitId]) {
        unitMap[lesson.unitId].lessons.push({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType,
          contentUrl: lesson.contentUrl,
          videoUrl: lesson.videoUrl,
        });
      }
    }

    const formatted = {
      success: true,
      id: courseData.id,
      title: courseData.title,
      slug: courseData.slug,
      price: Number(courseData.price),
      description: courseData.description || "No description available",
      teacher: {
        name: courseData.teacher?.name || "Unknown Instructor",
        profileImage: courseData.teacher?.profileImage || null,
      },
      units,
    };

    appendToLogFile(`[SUCCESS] ${new Date().toISOString()} - Fetched course: ${slug}`);
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching course by slug:", err);
    appendToLogFile(`[ERROR] ${new Date().toISOString()} - Fetch course by slug ${req.params.slug}: ${err.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/:id — fetch course by ID
router.get("/:id", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Invalid course ID: ${req.params.id}`);
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
          required: false,
        },
        {
          model: Lesson,
          as: "lessons",
          attributes: [
            "id",
            "title",
            "content",
            "contentType",
            "contentUrl",
            "videoUrl",
            "isUnitHeader",
            "unitId",
            "orderIndex",
          ],
          order: [["orderIndex", "ASC"]],
          required: false,
        },
      ],
    });

    if (!course) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Course not found for ID: ${courseId}`);
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();

    // Group lessons into units
    const lessons = courseData.lessons || [];
    const units = [];
    const unitMap = {};

    for (const lesson of lessons) {
      if (lesson.isUnitHeader) {
        unitMap[lesson.id] = {
          unitName: lesson.title,
          lessons: [],
        };
        units.push(unitMap[lesson.id]);
      } else if (lesson.unitId && unitMap[lesson.unitId]) {
        unitMap[lesson.unitId].lessons.push({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType,
          contentUrl: lesson.contentUrl,
          videoUrl: lesson.videoUrl,
        });
      }
    }

    const formatted = {
      success: true,
      id: courseData.id,
      title: courseData.title,
      slug: courseData.slug,
      price: Number(courseData.price),
      description: courseData.description || "No description available",
      teacher: {
        name: courseData.teacher?.name || "Unknown",
      },
      units,
      unitCount: units.length,
      lessonCount: units.reduce((count, unit) => count + unit.lessons.length, 0),
    };

    appendToLogFile(`[SUCCESS] ${new Date().toISOString()} - Fetched course by ID: ${courseId}`);
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching course by ID:", err);
    appendToLogFile(`[ERROR] ${new Date().toISOString()} - Fetch course by ID ${req.params.id}: ${err.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/:id/lessons — fetch lessons for a course
router.get("/:id/lessons", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Invalid course ID: ${req.params.id}`);
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      appendToLogFile(`[ERROR] ${new Date().toISOString()} - Course not found for ID: ${courseId}`);
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      attributes: [
        "id",
        "title",
        "content",
        "contentType",
        "contentUrl",
        "videoUrl",
        "isUnitHeader",
        "unitId",
        "orderIndex",
      ],
      order: [["orderIndex", "ASC"]],
    });

    // Group lessons into units
    const units = [];
    const unitMap = {};

    for (const lesson of lessons) {
      if (lesson.isUnitHeader) {
        unitMap[lesson.id] = {
          unitName: lesson.title,
          lessons: [],
        };
        units.push(unitMap[lesson.id]);
      } else if (lesson.unitId && unitMap[lesson.unitId]) {
        unitMap[lesson.unitId].lessons.push({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType,
          contentUrl: lesson.contentUrl,
          videoUrl: lesson.videoUrl,
        });
      }
    }

    appendToLogFile(`[SUCCESS] ${new Date().toISOString()} - Fetched lessons for course ID: ${courseId}`);
    res.json({
      success: true,
      courseId,
      units,
    });
  } catch (err) {
    console.error("Error fetching lessons for course:", err);
    appendToLogFile(`[ERROR] ${new Date().toISOString()} - Fetch lessons for course ${req.params.id}: ${err.message}`);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: err.message,
    });
  }
});

module.exports = router;