// const express = require("express");
// const { Course, User } = require("../models");
// const router = express.Router();

// // GET /api/v1/courses — list all courses
// router.get("/", async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       attributes: ["id", "title", "description", "price", "slug"],
//     });

//     const formattedCourses = courses.map((course) => ({
//       id: course.id,
//       title: course.title,
//       slug: course.slug,
//       description: course.description,
//       price: Number(course.price),
//     }));

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

// // GET /api/v1/courses/slug/:slug — fetch course by slug (for viewer/enrollment)
// // GET /api/v1/courses/slug/:slug
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const course = await Course.findOne({
//       where: { slug: req.params.slug },
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email", "profileImage"], // add profileImage
//         },
//         {
//           association: "units",
//           include: [
//             {
//               association: "lessons",
//               attributes: ["id", "title", "description"],
//             },
//           ],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const courseData = course.toJSON();

//     const formatted = {
//       success: true,
//       id: courseData.id,
//       title: courseData.title,
//       price: Number(courseData.price),
//       description: courseData.description,
//       studentCount: courseData.studentCount || 0,
//       introVideoUrl: courseData.introVideoUrl || null,
//       thumbnail: courseData.thumbnail || null,
//       teacher: {
//         name: courseData.teacher?.name || "Unknown Instructor",
//         profileImage: courseData.teacher?.profileImage || null,
//       },
//       units: (courseData.units || []).map((unit) => ({
//         unitName: unit.unitName,
//         lessons: (unit.lessons || []).map((lesson) => ({
//           id: lesson.id,
//           title: lesson.title,
//           description: lesson.description,
//         })),
//       })),
//     };

//     res.json(formatted);
//   } catch (err) {
//     console.error("Error fetching course by slug:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// // GET /api/v1/courses/:id — fetch course by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const course = await Course.findByPk(req.params.id, {
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const courseData = course.toJSON();

//     res.json({
//       id: courseData.id,
//       title: courseData.title,
//       price: Number(courseData.price),
//       description: courseData.description || "No description available",
//       teacher: {
//         name: courseData.teacher?.name || "Unknown",
//       },
//       features: courseData.features || [],
//       lessons: [],
//       unitCount: 0,
//       lessonCount: 0,
//     });
//   } catch (err) {
//     console.error("Error fetching course by ID:", err);
//     res.status(500).json({
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// });

// module.exports = router;





const express = require("express");
const { Course, User, Lesson } = require("../models");
const router = express.Router();

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
      price: Number(course.price) || 0,
    }));

    res.json({ success: true, courses: formattedCourses });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching courses:`, {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: err.message,
    });
  }
});

// GET /api/v1/courses/slug/:slug — fetch course by slug (for viewer/enrollment)
router.get("/slug/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email", "profileImage"],
        },
        {
          model: Lesson,
          as: "lessons",
          where: { isUnitHeader: true }, // Fetch unit headers as "units"
          required: false, // Allow courses with no units
          include: [
            {
              model: Lesson,
              as: "unitLessons", // Child lessons linked via unitId
              where: { isUnitHeader: false }, // Non-unit-header lessons
              required: false, // Allow units with no lessons
              attributes: ["id", "title", "content"],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();

    const formatted = {
      success: true,
      id: courseData.id,
      title: courseData.title,
      price: Number(courseData.price) || 0,
      description: courseData.description || "No description available",
      studentCount: Number(courseData.studentCount) || 0,
      introVideoUrl: courseData.introVideoUrl || null,
      thumbnail: courseData.thumbnail || null,
      teacher: {
        name: courseData.teacher?.name || "Unknown Instructor",
        profileImage: courseData.teacher?.profileImage || null,
      },
      units: (courseData.lessons || []).map((unit) => ({
        unitName: unit.title,
        lessons: (unit.unitLessons || []).map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.content || "No content available",
        })),
      })),
    };

    res.json(formatted);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error fetching course by slug:`,
      {
        message: err.message,
        stack: err.stack,
        path: req.path,
        params: req.params,
      }
    );
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
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email", "profileImage"],
        },
        {
          model: Lesson,
          as: "lessons",
          where: { isUnitHeader: true }, // Fetch unit headers as "units"
          required: false,
          include: [
            {
              model: Lesson,
              as: "unitLessons",
              where: { isUnitHeader: false },
              required: false,
              attributes: ["id", "title", "content"],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();

    const formatted = {
      success: true,
      id: courseData.id,
      title: courseData.title,
      price: Number(courseData.price) || 0,
      description: courseData.description || "No description available",
      teacher: {
        name: courseData.teacher?.name || "Unknown Instructor",
        profileImage: courseData.teacher?.profileImage || null,
      },
      units: (courseData.lessons || []).map((unit) => ({
        unitName: unit.title,
        lessons: (unit.unitLessons || []).map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.content || "No content available",
        })),
      })),
      unitCount: (courseData.lessons || []).length,
      lessonCount: (courseData.lessons || []).reduce(
        (count, unit) => count + (unit.unitLessons || []).length,
        0
      ),
    };

    res.json(formatted);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error fetching course by ID:`,
      {
        message: err.message,
        stack: err.stack,
        path: req.path,
        params: req.params,
      }
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

module.exports = router;
