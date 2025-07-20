// const { Lesson, Course, UserCourseAccess } = require("../models");
// const path = require("path");
// const fs = require("fs");
// const logLessonAction = require("../utils/logLessonAction");

// // GET lessons for a course (students, teachers, public previews)
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user?.id;
//     const role = req.user?.role;

//     console.log(
//       `Fetching lessons for courseId: ${courseId}, userId: ${userId}, role: ${role}`
//     );

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       console.error(`Course not found for ID: ${courseId}`);
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // Public preview access (unauthenticated visitor)
//     if (!req.user && req.query.preview === "true") {
//       const previewLessons = await Lesson.findAll({
//         where: { courseId, isPreview: true },
//         order: [["orderIndex", "ASC"]],
//       });
//       console.log(
//         `Fetched ${previewLessons.length} preview lessons for courseId: ${courseId}`
//       );
//       return res.json({ success: true, lessons: previewLessons });
//     }

//     // Student access check
//     if (role === "student") {
//       const access = await UserCourseAccess.findOne({
//         where: { userId, courseId, approved: true },
//       });
//       if (!access) {
//         console.error(
//           `Access denied for userId: ${userId}, courseId: ${courseId}`
//         );
//         return res.status(403).json({ error: "Access denied" });
//       }
//     }

//     // Teacher or approved student
//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     console.log(`Fetched ${lessons.length} lessons for courseId: ${courseId}`);
//     res.json({ success: true, lessons });
//   } catch (error) {
//     console.error("❌ LESSON FETCH ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Lesson fetch error", details: error.message });
//   }
// };

// // GET units for a course (teachers only)
// exports.getUnitsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log(`Fetching units for courseId: ${courseId}`);
//     const units = await Lesson.findAll({
//       where: { courseId, isUnitHeader: true },
//       attributes: ["id", "title"],
//       order: [["orderIndex", "ASC"]],
//     });
//     console.log(`Fetched ${units.length} units for courseId: ${courseId}`);
//     res.json({ success: true, units });
//   } catch (error) {
//     console.error("❌ UNIT FETCH ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to fetch units", details: error.message });
//   }
// };

// // POST create lesson (teachers only)
// exports.createLesson = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const {
//       title,
//       content,
//       contentType = "text",
//       videoUrl,
//       orderIndex = 0,
//       isUnitHeader = false,
//       isPreview = false,
//       unitId,
//     } = req.body;
//     const userId = req.user?.id;
//     const role = req.user?.role;

//     console.log(
//       `Creating lesson for courseId: ${courseId}, userId: ${userId}, role: ${role}`
//     );
//     console.log("Request body:", req.body);
//     console.log("Uploaded file:", req.file);

//     // Validate authentication
//     if (!userId || !role) {
//       console.error("No authenticated user");
//       return res.status(401).json({ error: "Authentication required" });
//     }

//     // Validate role
//     if (role !== "teacher") {
//       console.error(`User role ${role} is not authorized to create lessons`);
//       return res
//         .status(403)
//         .json({ error: "Only teachers can create lessons" });
//     }

//     // Validate title
//     if (!title) {
//       console.error("Title is required");
//       return res.status(400).json({ error: "Title is required" });
//     }

//     // Validate course
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       console.error(`Course not found for ID: ${courseId}`);
//       return res.status(404).json({ error: "Course not found" });
//     }

//     if (course.teacherId !== userId) {
//       console.error(
//         `Unauthorized: userId ${userId} is not the teacher (teacherId: ${course.teacherId})`
//       );
//       return res
//         .status(403)
//         .json({ error: "Only the course teacher can add lessons" });
//     }

//     // Handle file upload
//     let contentUrl = null;
//     if (req.file) {
//       const uploadDir = path.join(__dirname, "..", "Uploads");
//       const filename = `${req.file.originalname}-${Date.now()}.pdf`;
//       const uploadPath = path.join(uploadDir, filename);
//       console.log(`Attempting to save file to: ${uploadPath}`);
//       try {
//         if (!fs.existsSync(uploadDir)) {
//           fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         fs.writeFileSync(uploadPath, req.file.buffer);
//         contentUrl = `/Uploads/${filename}`;
//         console.log(`File saved successfully: ${contentUrl}`);
//       } catch (fileError) {
//         console.error(
//           "File write error:",
//           fileError.stack || fileError.message
//         );
//         return res
//           .status(500)
//           .json({ error: "Failed to save file", details: fileError.message });
//       }
//     }

//     // Create lesson
//     console.log("Creating lesson in database...");
//     const newLesson = await Lesson.create({
//       courseId: parseInt(courseId),
//       title,
//       content: contentType === "text" ? content : null,
//       contentType: req.file ? "file" : contentType,
//       contentUrl,
//       videoUrl: contentType === "video" ? videoUrl : null,
//       orderIndex: parseInt(orderIndex),
//       isUnitHeader: isUnitHeader === "true" || isUnitHeader === true,
//       isPreview: isPreview === "true" || isPreview === true,
//       unitId: unitId ? parseInt(unitId) : null,
//       userId,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     await logLessonAction("CREATE", newLesson, req.user);
//     console.log("✅ Lesson created:", newLesson.title);

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (error) {
//     console.error("🔥 CREATE ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// // PUT update lesson (teachers only)
// exports.updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log(`Updating lessonId: ${lessonId}`);
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       console.error(`Lesson not found for ID: ${lessonId}`);
//       return res.status(404).json({ error: "Lesson not found" });
//     }

//     const course = await Course.findByPk(lesson.courseId);
//     if (!course || course.teacherId !== req.user.id) {
//       console.error(
//         `Unauthorized: userId ${req.user.id} cannot update lessonId: ${lessonId}`
//       );
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to update this lesson" });
//     }

//     await lesson.update(req.body);
//     await logLessonAction("UPDATE", lesson, req.user);
//     console.log("✅ Lesson updated:", lesson.title);

//     res.json({ success: true, lesson });
//   } catch (error) {
//     console.error("❌ UPDATE ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to update lesson", details: error.message });
//   }
// };

// // DELETE lesson (teachers only)
// exports.deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log(`Deleting lessonId: ${lessonId}`);
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       console.error(`Lesson not found for ID: ${lessonId}`);
//       return res.status(404).json({ error: "Lesson not found" });
//     }

//     const course = await Course.findByPk(lesson.courseId);
//     if (!course || course.teacherId !== req.user.id) {
//       console.error(
//         `Unauthorized: userId ${req.user.id} cannot delete lessonId: ${lessonId}`
//       );
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to delete this lesson" });
//     }

//     await lesson.destroy();
//     await logLessonAction("DELETE", lesson, req.user);
//     console.log("🗑 Lesson deleted:", lesson.title);

//     res.json({ success: true, message: "Lesson deleted" });
//   } catch (error) {
//     console.error("❌ DELETE ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to delete lesson", details: error.message });
//   }
// };

// // PATCH toggle lesson preview (teachers only)
// exports.toggleLessonPreview = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log(`Toggling preview for lessonId: ${lessonId}`);
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       console.error(`Lesson not found for ID: ${lessonId}`);
//       return res.status(404).json({ error: "Lesson not found" });
//     }

//     const course = await Course.findByPk(lesson.courseId);
//     if (!course || course.teacherId !== req.user.id) {
//       console.error(
//         `Unauthorized: userId ${req.user.id} cannot toggle preview for lessonId: ${lessonId}`
//       );
//       return res
//         .status(403)
//         .json({ error: "Not authorized to toggle preview" });
//     }

//     lesson.isPreview = !lesson.isPreview;
//     await lesson.save();

//     await logLessonAction("TOGGLE_PREVIEW", lesson, req.user);
//     console.log(
//       `🔁 Lesson preview toggled: ${lesson.title} → ${lesson.isPreview}`
//     );

//     res.json({ success: true, isPreview: lesson.isPreview });
//   } catch (error) {
//     console.error("❌ TOGGLE PREVIEW ERROR:", error.stack || error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to toggle preview", details: error.message });
//   }
// };




const { Lesson, Course } = require("../models");

// 📘 Get lessons by course
exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      order: [["orderIndex", "ASC"]],
    });
    res.json(lessons);
  } catch (err) {
    console.error("❌ Error fetching lessons:", err.message);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

// 📘 Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const {
      title,
      content,
      contentType,
      contentUrl,
      videoUrl,
      linkUrl,
      quizTitle,
      embedUrl,
    } = req.body;

    let filePath = null;
    let fileSize = null;

    if (req.file) {
      filePath = "/Uploads/" + req.file.filename;
      fileSize = req.file.size;
    }

    const lesson = await Lesson.create({
      courseId: req.params.courseId,
      title,
      content,
      contentType: contentType || (filePath ? "file" : "text"),
      contentUrl: contentUrl || filePath,
      videoUrl,
      linkUrl,
      quizTitle,
      embedUrl,
      fileSize,
      userId: req.user.id,
      orderIndex: 0,
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error("❌ Error creating lesson:", err.message);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

// 🗑️ DELETE lesson
exports.deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;

  console.log("🔥 DELETE lesson request received");
  console.log("Lesson ID:", lessonId);
  console.log("User ID:", userId);

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      console.error("❌ Lesson not found");
      return res.status(404).json({ error: "Lesson not found" });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course) {
      console.error("❌ Course not found for the lesson");
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.teacherId !== userId) {
      console.error("❌ User not authorized to delete this lesson");
      return res.status(403).json({ error: "Unauthorized" });
    }

    await lesson.destroy();
    console.log("✅ Lesson deleted successfully");

    res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("❌ Server error while deleting lesson:", err.stack);
    res.status(500).json({
      error: "Server error while deleting lesson",
      details: err.message,
    });
  }
};

// ✅ Track lesson view
exports.trackLessonView = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;

  console.log("📊 Tracking lesson view", { lessonId, userId });

  if (!lessonId || !userId) {
    return res.status(400).json({ error: "Invalid tracking data" });
  }

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      console.warn("⚠️ Lesson not found for view tracking");
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Optional: Save to tracking table (future feature)
    // await LessonView.create({ lessonId, userId });

    res.status(200).json({ success: true, message: "View tracked" });
  } catch (err) {
    console.error("❌ Error tracking lesson view:", err.message);
    res.status(500).json({ error: "Failed to track view" });
  }
};

// 🟡 Toggle preview
exports.toggleLessonPreview = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    lesson.isPreview = !lesson.isPreview;
    await lesson.save();

    res.json({ success: true, isPreview: lesson.isPreview });
  } catch (err) {
    console.error("❌ Error toggling preview:", err.message);
    res.status(500).json({ error: "Failed to toggle preview" });
  }
};

// 🔄 Update lesson
exports.updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const updates = req.body;

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    await lesson.update(updates);
    res.json({ success: true, lesson });
  } catch (err) {
    console.error("❌ Error updating lesson:", err.message);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

// 📘 Get units (optional)
exports.getUnitsByCourse = async (req, res) => {
  // implement if needed
  res.status(200).json({ message: "Units endpoint not implemented yet." });
};
