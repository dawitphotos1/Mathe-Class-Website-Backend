const { Lesson, Course } = require("../models");

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