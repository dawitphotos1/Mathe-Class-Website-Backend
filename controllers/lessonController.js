// const { Lesson, Course, UserCourseAccess } = require("../models");

// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user.id;

//     const enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId, approved: true },
//     });

//     if (!enrollment) {
//       return res
//         .status(403)
//         .json({ error: "Not enrolled or access not approved" });
//     }

//     const course = await Course.findByPk(courseId, {
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "content",
//             "contentType",
//             "contentUrl",
//             "videoUrl",
//             "orderIndex",
//             "isUnitHeader",
//             "isPreview",
//           ],
//           order: [["orderIndex", "ASC"]],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     res.json({ success: true, lessons: course.lessons });
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// exports.createLesson = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { title, content, contentType, orderIndex, isUnitHeader, isPreview } =
//       req.body;

//     if (!title) {
//       return res.status(400).json({ error: "Title is required" });
//     }

//     const newLesson = await Lesson.create({
//       courseId,
//       title,
//       content,
//       contentType,
//       orderIndex,
//       isUnitHeader,
//       isPreview,
//       // Optionally include: contentUrl, videoUrl from req.files if uploading
//     });

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (error) {
//     console.error("Error creating lesson:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };




const { Lesson, Course, UserCourseAccess } = require("../models");

// ✅ GET /api/v1/lessons/:courseId
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId, approved: true },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not enrolled in this course." });
    }

    const course = await Course.findByPk(courseId, {
      include: [
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
            "orderIndex",
            "isUnitHeader",
            "isPreview",
          ],
          order: [["orderIndex", "ASC"]],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, lessons: course.lessons });
  } catch (error) {
    console.error("🔥 Error fetching lessons:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// ✅ POST /api/v1/lessons/:courseId
exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, isUnitHeader, isPreview } =
      req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newLesson = await Lesson.create({
      courseId,
      title,
      content,
      contentType,
      orderIndex,
      isUnitHeader,
      isPreview,
      // Optional: add contentUrl/videoUrl if supported
    });

    res.status(201).json({ success: true, lesson: newLesson });
  } catch (error) {
    console.error("🔥 Error creating lesson:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
