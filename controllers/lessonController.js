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





const { Lesson, Course } = require("../models");
const { storage } = require("../config/firebaseAdmin");
const { ref, uploadBytes, getDownloadURL } = require("firebase-admin/storage");
const { v4: uuidv4 } = require("uuid");

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

exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, isPreview, isUnitHeader, orderIndex } =
      req.body;
    const user = req.user;

    if (user.role !== "teacher" && user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only teachers or admins can create lessons" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (user.role === "teacher" && course.teacherId !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only create lessons for your own courses" });
    }

    let contentUrl = null;
    let videoUrl = null;

    // Handle file upload
    if (req.files?.contentFile) {
      const file = req.files.contentFile;
      const fileRef = ref(
        storage.bucket(),
        `lessons/content/${uuidv4()}_${file.name}`
      );
      await uploadBytes(fileRef, file.data);
      contentUrl = await getDownloadURL(fileRef);
    }

    // Handle video upload
    if (req.files?.videoFile) {
      const video = req.files.videoFile;
      const videoRef = ref(
        storage.bucket(),
        `lessons/videos/${uuidv4()}_${video.name}`
      );
      await uploadBytes(videoRef, video.data);
      videoUrl = await getDownloadURL(videoRef);
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      contentType: contentType || "text",
      contentUrl,
      videoUrl,
      isPreview: isPreview || false,
      isUnitHeader: isUnitHeader || false,
      orderIndex: orderIndex || 0,
      userId: user.id,
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