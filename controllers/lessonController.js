// const { Lesson, Course } = require("../models");
// const path = require("path");
// const fs = require("fs");

// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const lessons = await Lesson.findAll({ where: { courseId } });
//     res.json({ success: true, lessons });
//   } catch (error) {
//     console.error("❌ getLessonsByCourse error:", error);
//     res.status(500).json({ error: "Failed to fetch lessons" });
//   }
// };

// exports.getUnitsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const units = await Lesson.findAll({
//       where: { courseId, isUnitHeader: true },
//       attributes: ["id", "title"],
//     });
//     res.json({ success: true, units });
//   } catch (error) {
//     console.error("❌ getUnitsByCourse error:", error);
//     res.status(500).json({ error: "Failed to fetch units" });
//   }
// };

// exports.createLesson = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { title, contentType = "text" } = req.body;

//     let contentUrl = null;
//     if (req.file) {
//       const filename = `${Date.now()}-${req.file.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       const uploadPath = path.join(__dirname, "..", "Uploads", filename);
//       fs.writeFileSync(uploadPath, req.file.buffer);
//       contentUrl = `/Uploads/${filename}`;
//     }

//     const newLesson = await Lesson.create({
//       courseId,
//       title,
//       contentType,
//       contentUrl,
//       userId: req.user.id,
//     });

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (error) {
//     console.error("❌ createLesson error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to create lesson", details: error.message });
//   }
// };

// exports.updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);

//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     await lesson.update(req.body);
//     res.json({ success: true, lesson });
//   } catch (error) {
//     console.error("❌ updateLesson error:", error);
//     res.status(500).json({ error: "Failed to update lesson" });
//   }
// };

// exports.deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;

//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res.status(404).json({ error: "Lesson not found" });
//     }

//     const course = await Course.findByPk(lesson.courseId);
//     if (!course) {
//       return res.status(404).json({ error: "Related course not found" });
//     }

//     if (course.teacherId !== req.user.id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     await lesson.destroy();
//     res.json({ success: true, message: "Lesson deleted successfully" });
//   } catch (error) {
//     console.error("❌ deleteLesson error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to delete lesson", details: error.message });
//   }
// };

// exports.toggleLessonPreview = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);

//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     lesson.isPreview = !lesson.isPreview;
//     await lesson.save();
//     res.json({ success: true, isPreview: lesson.isPreview });
//   } catch (error) {
//     console.error("❌ toggleLessonPreview error:", error);
//     res.status(500).json({ error: "Failed to toggle preview" });
//   }
// };

// exports.trackLessonView = async (req, res) => {
//   try {
//     console.log(`📊 Tracking view for lesson ${req.params.lessonId}`);
//     res.json({ success: true, message: "View tracked" });
//   } catch (error) {
//     console.error("❌ trackLessonView error:", error);
//     res.status(500).json({ error: "Failed to track view" });
//   }
// };




const { Lesson, Course } = require("../models");
const path = require("path");
const fs = require("fs");

// 📁 Ensure Uploads directory exists
const uploadsDir = path.join(__dirname, "..", "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📁 Uploads directory created");
}

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({ where: { courseId } });
    res.json({ success: true, lessons });
  } catch (error) {
    console.error("❌ getLessonsByCourse error:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

exports.getUnitsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const units = await Lesson.findAll({
      where: { courseId, isUnitHeader: true },
      attributes: ["id", "title"],
    });
    res.json({ success: true, units });
  } catch (error) {
    console.error("❌ getUnitsByCourse error:", error);
    res.status(500).json({ error: "Failed to fetch units" });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      contentType = "text",
      content = "",
      videoUrl = "",
      isUnitHeader = false,
      isPreview = false,
      orderIndex = 0,
      unitId = null,
    } = req.body;

    let contentUrl = null;

    // 🔽 If uploading a PDF file
    if (contentType === "file" && req.file) {
      const filename = `${Date.now()}-${req.file.originalname.replace(
        /\s+/g,
        "_"
      )}`;
      const uploadPath = path.join(uploadsDir, filename);

      console.log("💾 Attempting to write file to:", uploadPath);

      try {
        fs.writeFileSync(uploadPath, req.file.buffer);
        contentUrl = `/Uploads/${filename}`;
      } catch (err) {
        console.error("🔥 File write error:", err.message);
        return res.status(500).json({
          error: "File save failed",
          details: err.message,
        });
      }
    }

    // 🔄 Create lesson record
    const newLesson = await Lesson.create({
      courseId,
      title,
      contentType,
      content: content || null,
      videoUrl: videoUrl || null,
      contentUrl,
      isUnitHeader: isUnitHeader === "true" || isUnitHeader === true,
      isPreview: isPreview === "true" || isPreview === true,
      orderIndex: parseInt(orderIndex, 10) || 0,
      unitId: unitId || null,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, lesson: newLesson });
  } catch (error) {
    console.error("❌ createLesson error:", error);
    res.status(500).json({
      error: "Failed to create lesson",
      details: error.message,
    });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    await lesson.update(req.body);
    res.json({ success: true, lesson });
  } catch (error) {
    console.error("❌ updateLesson error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course) {
      return res.status(404).json({ error: "Related course not found" });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await lesson.destroy();
    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("❌ deleteLesson error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete lesson", details: error.message });
  }
};

exports.toggleLessonPreview = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    lesson.isPreview = !lesson.isPreview;
    await lesson.save();
    res.json({ success: true, isPreview: lesson.isPreview });
  } catch (error) {
    console.error("❌ toggleLessonPreview error:", error);
    res.status(500).json({ error: "Failed to toggle preview" });
  }
};

exports.trackLessonView = async (req, res) => {
  try {
    console.log(`📊 Tracking view for lesson ${req.params.lessonId}`);
    res.json({ success: true, message: "View tracked" });
  } catch (error) {
    console.error("❌ trackLessonView error:", error);
    res.status(500).json({ error: "Failed to track view" });
  }
};
