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
const path = require("path");

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId, approved: true },
    });

    if (
      !enrollment &&
      req.user.role !== "teacher" &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not enrolled or access not approved" });
    }

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
          "unitId",
        ],
        order: [["orderIndex", "ASC"]],
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Group lessons into units
    const lessons = course.lessons || [];
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
          isPreview: lesson.isPreview,
        });
      }
    }

    res.json({ success: true, courseId, units });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      content,
      contentType,
      videoUrl,
      orderIndex,
      isUnitHeader,
      isPreview,
      unitId,
    } = req.body;
    const contentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !orderIndex) {
      return res
        .status(400)
        .json({ error: "Title and order index are required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role === "teacher" && course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({
          error: "You are not authorized to add lessons to this course",
        });
    }

    const lesson = await Lesson.create({
      courseId: parseInt(courseId),
      title,
      content: content || null,
      contentType: contentType || "text",
      contentUrl,
      videoUrl: videoUrl || null,
      orderIndex: parseInt(orderIndex),
      isUnitHeader: isUnitHeader || false,
      isPreview: isPreview || false,
      unitId: unitId || null,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};