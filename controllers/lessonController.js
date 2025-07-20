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



const { Lesson, Course, UserCourseAccess } = require("../models");
const path = require("path");
const fs = require("fs");
const logLessonAction = require("../utils/logLessonAction");

exports.createLesson = async (req, res) => {
  // ...previous validation...

  let contentUrl = null;
  if (req.file) {
    const uploadDir = path.join(__dirname, "../Uploads");
    const ext = path.extname(req.file.originalname) || ".pdf";
    const filename = `${path.basename(req.file.originalname, ext).replace(/\s+/g,"_")}-${Date.now()}${ext}`;
    const uploadPath = path.join(uploadDir, filename);

    try {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(uploadPath, req.file.buffer);
      contentUrl = `/Uploads/${filename}`;
      console.log("File saved:", uploadPath);
    } catch (fileError) {
      console.error("File save error:", fileError);
      return res.status(500).json({ error: "Failed to save file" });
    }
  }

  // Save lesson
  const lesson = await Lesson.create({
    // ...fields...
    contentUrl,
  });
  await logLessonAction("CREATE", lesson, req.user);
  return res.status(201).json({ success: true, lesson });
};

exports.deleteLesson = async (req, res) => {
  const lessonId = req.params.lessonId;
  console.log("Request to delete lesson", lessonId, "by user", req.user?.id);

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const course = await Course.findByPk(lesson.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (course.teacherId !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    // Delete file on disk if exists
    if (lesson.contentUrl) {
      const filepath = path.join(__dirname, "..", lesson.contentUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log("Deleted file from disk:", filepath);
      }
    }

    await lesson.destroy();
    await logLessonAction("DELETE", lesson, req.user);
    return res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("deleteLesson error:", err.stack || err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// trackLessonView...
