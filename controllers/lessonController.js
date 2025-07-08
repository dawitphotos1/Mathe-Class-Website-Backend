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

// ✅ GET /api/v1/courses/:courseId/lessons
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    console.log("🔍 courseId:", courseId, "userId:", userId); // required debug

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId, approved: true },
    });

    if (!enrollment) {
      console.warn("⛔ Not enrolled/approved");
      return res.status(403).json({ error: "Not enrolled or access denied" });
    }

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Lesson,
          as: "lessons",
          separate: true,
          order: [["orderIndex", "ASC"]],
        },
      ],
    });

    if (!course) {
      console.warn("❌ Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("✅ Lessons:", course.lessons?.length);
    res.json({ success: true, lessons: course.lessons });
  } catch (error) {
    console.error("🔥 LESSON FETCH ERROR:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};




// ✅ POST /api/v1/courses/:courseId/lessons
// Inside lessonController.js

exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      content,
      contentType = "text",
      contentUrl,
      videoUrl,
      orderIndex = 0,
      isUnitHeader = false,
      isPreview = false,
      unitId,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newLesson = await Lesson.create({
      courseId: parseInt(courseId),
      title,
      content,
      contentType,
      contentUrl,
      videoUrl,
      orderIndex,
      isUnitHeader,
      isPreview,
      unitId: unitId || null,
      userId: req.user.id,
    });
    
    exports.updateLesson = async (req, res) => {
      try {
        const { lessonId } = req.params;
        const lesson = await Lesson.findByPk(lessonId);

        if (!lesson) return res.status(404).json({ error: "Lesson not found" });

        await lesson.update(req.body);
        res.json({ success: true, lesson });
      } catch (error) {
        console.error("❌ Update error:", error);
        res.status(500).json({ error: "Failed to update lesson" });
      }
    };

    exports.deleteLesson = async (req, res) => {
      try {
        const { lessonId } = req.params;
        const lesson = await Lesson.findByPk(lessonId);

        if (!lesson) return res.status(404).json({ error: "Lesson not found" });

        await lesson.destroy();
        res.json({ success: true, message: "Lesson deleted" });
      } catch (error) {
        console.error("❌ Delete error:", error);
        res.status(500).json({ error: "Failed to delete lesson" });
      }
    };
    


    res.status(201).json({ success: true, lesson: newLesson });
  } catch (error) {
    console.error("🔥 Error creating lesson:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};
