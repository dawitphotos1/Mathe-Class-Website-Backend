
// const express = require("express");
// const { Course, Teacher } = require("../models");
// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       attributes: ["id", "title", "description", "price"],
//     });

//     const formattedCourses = courses.map((course) => ({
//       id: course.id,
//       title: course.title,
//       description: course.description,
//       price: Number(course.price),
//     }));

//     console.log("Fetched courses:", formattedCourses);
//     res.json({ success: true, courses: formattedCourses });
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch courses",
//       details: err.message,
//     });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const courseId = req.params.id;
//     const course = await Course.findByPk(courseId, {
//       include: [
//         {
//           model: Teacher,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//           required: false,
//         },
//       ],
//     });

//     if (!course) {
//       console.log(`Course not found for ID: ${courseId}`);
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     const courseData = course.toJSON();
//     // Placeholder for lessons
//     courseData.lessons = [];
//     courseData.unitCount = 0;
//     courseData.lessonCount = 0;

//     if (!courseData.teacher) {
//       console.warn(`Teacher not found for course ID: ${courseId}`);
//       courseData.teacher = { id: null, name: "Unknown", email: null };
//     }

//     console.log("Fetched course:", courseData);
//     res.json({ success: true, ...courseData });
//   } catch (err) {
//     console.error("Error fetching course:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const { Course, User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to restrict to admin or teacher
const isAdminOrTeacher = (req, res, next) => {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, error: "Forbidden" });
};

// GET /api/v1/courses - Fetch all courses
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/v1/courses: Fetching all courses");
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name"],
        },
      ],
    });

    console.log(
      "GET /api/v1/courses: Courses found:",
      courses.map((c) => ({ id: c.id, title: c.title }))
    );

    // Ensure teacher is null if not found
    const sanitizedCourses = courses.map((course) => ({
      ...course.toJSON(),
      teacher: course.teacher || { id: null, name: "Unknown Instructor" },
    }));

    res.json({ success: true, courses: sanitizedCourses });
  } catch (error) {
    console.error("GET /api/v1/courses: Error fetching courses:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: error.message,
    });
  }
});

// GET /api/v1/courses/:id - Fetch a single course
router.get("/:id", async (req, res) => {
  try {
    console.log(
      "GET /api/v1/courses/:id: Fetching course with id:",
      req.params.id
    );
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!course) {
      console.log(
        "GET /api/v1/courses/:id: Course not found for id:",
        req.params.id
      );
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    // Sanitize teacher data
    const courseData = {
      ...course.toJSON(),
      teacher: course.teacher || { id: null, name: "Unknown Instructor" },
    };

    console.log("GET /api/v1/courses/:id: Course found:", {
      id: courseData.id,
      title: courseData.title,
    });
    res.json({ success: true, ...courseData });
  } catch (error) {
    console.error("GET /api/v1/courses/:id: Error fetching course:", {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: error.message,
    });
  }
});

// POST /api/v1/courses - Create a new course (teacher/admin only)
router.post("/", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price == null) {
      return res.status(400).json({
        success: false,
        error: "Title, description, and price are required",
      });
    }

    console.log("POST /api/v1/courses: Creating course:", { title, price });
    const course = await Course.create({
      title,
      description,
      price: parseFloat(price),
      teacherId: req.user.id, // Set teacher as the authenticated user
    });

    console.log("POST /api/v1/courses: Course created:", {
      id: course.id,
      title: course.title,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("POST /api/v1/courses: Error creating course:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
});

// PUT /api/v1/courses/:id - Update a course (teacher/admin only)
router.put("/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    console.log(
      "PUT /api/v1/courses/:id: Updating course with id:",
      req.params.id
    );

    const course = await Course.findByPk(req.params.id);
    if (!course) {
      console.log(
        "PUT /api/v1/courses/:id: Course not found for id:",
        req.params.id
      );
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    // Only allow the course's teacher or admin to update
    if (course.teacherId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await course.update({
      title: title || course.title,
      description: description || course.description,
      price: price != null ? parseFloat(price) : course.price,
    });

    console.log("PUT /api/v1/courses/:id: Course updated:", {
      id: course.id,
      title: course.title,
    });
    res.json({ success: true, course });
  } catch (error) {
    console.error("PUT /api/v1/courses/:id: Error updating course:", {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to update course",
      details: error.message,
    });
  }
});

// DELETE /api/v1/courses/:id - Delete a course (teacher/admin only)
router.delete("/:id", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    console.log(
      "DELETE /api/v1/courses/:id: Deleting course with id:",
      req.params.id
    );
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      console.log(
        "DELETE /api/v1/courses/:id: Course not found for id:",
        req.params.id
      );
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    // Only allow the course's teacher or admin to delete
    if (course.teacherId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await course.destroy();
    console.log("DELETE /api/v1/courses/:id: Course deleted:", {
      id: req.params.id,
    });
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/v1/courses/:id: Error deleting course:", {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to delete course",
      details: error.message,
    });
  }
});

module.exports = router;