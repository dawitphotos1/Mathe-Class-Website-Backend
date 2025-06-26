
// const express = require("express");
// const { Course, User, Lesson } = require("../models");
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
// router.get("/slug/:slug", async (req, res) => {
//   try {
//     const course = await Course.findOne({
//       where: { slug: req.params.slug },
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email", "profileImage"],
//         },
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "contentType",
//             "contentUrl",
//             "isUnitHeader",
//             "unitId",
//             "orderIndex",
//           ],
//           order: [["orderIndex", "ASC"]],
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "orderIndex", "ASC"]],
//     });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     const courseData = course.toJSON();

//     // 🧠 Group lessons into units based on isUnitHeader and unitId
//     const lessons = courseData.lessons || [];
//     const units = [];
//     const unitMap = {};

//     for (const lesson of lessons) {
//       if (lesson.isUnitHeader) {
//         unitMap[lesson.id] = {
//           unitName: lesson.title,
//           lessons: [],
//         };
//         units.push(unitMap[lesson.id]);
//       } else if (lesson.unitId && unitMap[lesson.unitId]) {
//         unitMap[lesson.unitId].lessons.push({
//           id: lesson.id,
//           title: lesson.title,
//           description: lesson.contentUrl || "",
//         });
//       }
//     }

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
//       units,
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
      description: course.description,
      price: Number(course.price),
    }));

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
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "orderIndex", "ASC"]],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const courseData = course.toJSON();

    // Group lessons into units based on isUnitHeader and unitId
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
      description: courseData.description,
      teacher: {
        name: courseData.teacher?.name || "Unknown Instructor",
        profileImage: courseData.teacher?.profileImage || null,
      },
      units,
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching course by slug:", err);
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
          attributes: ["id", "name", "email"],
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
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
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

    res.json({
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
      lessonCount: units.reduce(
        (count, unit) => count + unit.lessons.length,
        0
      ),
    });
  } catch (err) {
    console.error("Error fetching course by ID:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
});

module.exports = router;