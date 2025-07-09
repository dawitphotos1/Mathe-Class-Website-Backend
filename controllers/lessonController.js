
// const { Lesson, Course, UserCourseAccess } = require("../models");

// // ✅ GET lessons
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user?.id;
//     console.log("🔍 courseId:", courseId, "userId:", userId);

//     const enrollment = await UserCourseAccess.findOne({
//       where: { userId, courseId, approved: true },
//     });

//     if (!enrollment) {
//       console.warn("⛔ Not enrolled/approved");
//       return res.status(403).json({ error: "Not enrolled or access denied" });
//     }

//     const course = await Course.findByPk(courseId, {
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           separate: true,
//           order: [["orderIndex", "ASC"]],
//         },
//       ],
//     });

//     if (!course) {
//       console.warn("❌ Course not found");
//       return res.status(404).json({ error: "Course not found" });
//     }

//     console.log("✅ Lessons:", course.lessons?.length);
//     res.json({ success: true, lessons: course.lessons });
//   } catch (error) {
//     console.error("🔥 LESSON FETCH ERROR:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// // ✅ POST lesson
// exports.createLesson = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const {
//       title,
//       content,
//       contentType = "text",
//       contentUrl,
//       videoUrl,
//       orderIndex = 0,
//       isUnitHeader = false,
//       isPreview = false,
//       unitId,
//     } = req.body;

//     if (!title) {
//       return res.status(400).json({ error: "Title is required" });
//     }

//     const newLesson = await Lesson.create({
//       courseId: parseInt(courseId),
//       title,
//       content,
//       contentType,
//       contentUrl,
//       videoUrl,
//       orderIndex,
//       isUnitHeader,
//       isPreview,
//       unitId: unitId || null,
//       userId: req.user.id,
//     });

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (error) {
//     console.error("🔥 Error creating lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Internal server error",
//       details: error.message,
//     });
//   }
// };

// // ✅ PUT lesson
// exports.updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);

//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     await lesson.update(req.body);
//     res.json({ success: true, lesson });
//   } catch (error) {
//     console.error("❌ Update error:", error);
//     res.status(500).json({ error: "Failed to update lesson" });
//   }
// };

// // ✅ DELETE lesson
// exports.deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);

//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     await lesson.destroy();
//     res.json({ success: true, message: "Lesson deleted" });
//   } catch (error) {
//     console.error("❌ Delete error:", error);
//     res.status(500).json({ error: "Failed to delete lesson" });
//   }
// };



const { Lesson, Course, UserCourseAccess } = require("../models");

// ✅ GET lessons for a course (student or teacher)
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    console.log(
      "🔍 Fetching lessons - courseId:",
      courseId,
      "userId:",
      userId,
      "role:",
      role
    );

    const course = await Course.findByPk(courseId);
    if (!course) {
      console.warn("❌ Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    // ✅ Only students require approval check
    if (role === "student") {
      const enrollment = await UserCourseAccess.findOne({
        where: { userId, courseId, approved: true },
      });

      if (!enrollment) {
        console.warn("⛔ Student not approved for course");
        return res
          .status(403)
          .json({ error: "Access denied: Not enrolled or not approved" });
      }
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });

    console.log(`✅ ${lessons.length} lessons fetched`);
    res.json({ success: true, lessons });
  } catch (error) {
    console.error("🔥 LESSON FETCH ERROR:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// ✅ POST create lesson (teachers only)
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

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // ✅ Ensure only the teacher of this course can add lessons
    if (req.user.role !== "teacher" || course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({
          error: "Unauthorized: Only the course teacher can add lessons",
        });
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

    console.log("✅ Lesson created:", newLesson.title);
    res.status(201).json({ success: true, lesson: newLesson });
  } catch (error) {
    console.error("🔥 CREATE ERROR:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// ✅ PUT update lesson (teachers only)
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course || course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You cannot update this lesson" });
    }

    await lesson.update(req.body);
    console.log("✅ Lesson updated:", lesson.title);
    res.json({ success: true, lesson });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res
      .status(500)
      .json({ error: "Failed to update lesson", details: error.message });
  }
};

// ✅ DELETE lesson (teachers only)
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course || course.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You cannot delete this lesson" });
    }

    await lesson.destroy();
    console.log("🗑 Lesson deleted:", lesson.title);
    res.json({ success: true, message: "Lesson deleted" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res
      .status(500)
      .json({ error: "Failed to delete lesson", details: error.message });
  }
};
