
const { UserCourseAccess, Course, Lesson, User } = require("../models");

exports.getMyCourses = async (req, res) => {
  try {
    console.log("✅ user:", req.user);

    const studentId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId: studentId },
      include: [
        {
          model: Course,
          as: "course",
          include: [
            {
              model: Lesson,
              as: "lessons",
              required: false,
            },
            {
              model: User,
              as: "teacher",
              required: false,
            },
          ],
        },
      ],
    });

    console.log("📦 Enrollments fetched:", enrollments.length);

    const courses = enrollments
      .map((entry, index) => {
        if (!entry.course) {
          console.warn(`⚠️ Enrollment ${index} missing course`);
          return null;
        }

        const course = entry.course;

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: entry.approved ? "approved" : "pending",
          teacher: course.teacher,
          lessons: course.lessons,
        };
      })
      .filter(Boolean);

    return res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 getMyCourses failed:", error.stack || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to load courses",
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
