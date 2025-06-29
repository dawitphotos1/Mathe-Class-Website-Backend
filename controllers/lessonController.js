// const { Lesson, Course } = require("../models");

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
//       include: {
//         model: Lesson,
//         as: "lessons",
//         attributes: [
//           "id",
//           "title",
//           "content",
//           "contentType",
//           "contentUrl",
//           "videoUrl",
//           "orderIndex",
//           "isUnitHeader",
//           "isPreview",
//         ],
//         order: [["orderIndex", "ASC"]],
//       },
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



const { Lesson, Course, UserCourseAccess } = require("../models");

// Fetch lessons for a given course with enrollment check
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is enrolled and approved for this course
    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId, approved: true },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "Not enrolled or access not approved" });
    }

    // Get course including lessons ordered by orderIndex
    const course = await Course.findByPk(courseId, {
      include: {
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
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, lessons: course.lessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Stub for creating a lesson (expand as needed)
exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, isUnitHeader, isPreview } =
      req.body;

    // You may want to handle uploaded files here: req.files.contentFile, req.files.videoFile

    // Basic validation (expand as needed)
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Create a new lesson record linked to the course
    const newLesson = await Lesson.create({
      courseId,
      title,
      content,
      contentType,
      orderIndex,
      isUnitHeader,
      isPreview,
      // Add contentUrl and videoUrl handling after you process uploads
    });

    res.status(201).json({ success: true, lesson: newLesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
