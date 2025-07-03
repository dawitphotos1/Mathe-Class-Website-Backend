
const { UserCourseAccess, Course, Lesson, User } = require("../models");

exports.createCourse = async (req, res) => {
  try {
    console.log("📥 Incoming request to create a course");
    console.log("🧠 req.user =", req.user);
    console.log("📦 req.body =", req.body);

    if (!req.user || req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ success: false, error: "Only teachers can create courses." });
    }

    const {
      title,
      description,
      category,
      slug,
      price = 0,
      materialUrl = null,
      attachmentUrls = [],
    } = req.body;

    // Validate required fields
    if (!title || !slug || !category || !description) {
      return res.status(400).json({
        success: false,
        error: "Title, slug, description, and category are required.",
      });
    }

    const newCourse = await Course.create({
      title,
      slug,
      description,
      category,
      price,
      materialUrl,
      attachmentUrls,
      teacherId: req.user.id,
    });

    console.log("✅ Course created successfully:", newCourse.id);

    return res.status(201).json({ success: true, course: newCourse });
  } catch (error) {
    console.error("🔥 Error in createCourse:", error.stack || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
};


// ✅ Add this function at the end of the file:
exports.confirmEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "courseId is required" });
    }

    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Already enrolled or pending approval",
        });
    }

    const newEnrollment = await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    return res.json({
      success: true,
      message: "Enrollment created and pending approval",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("🔥 Error in confirmEnrollment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
      details: error.message,
    });
  }
};
