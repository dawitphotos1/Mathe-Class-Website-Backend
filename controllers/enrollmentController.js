
const { UserCourseAccess, Course, Lesson, User } = require("../models");

exports.getMyCourses = async (req, res) => {
  try {
    console.log("📥 Incoming /my-courses request");
    console.log("🔍 req.user =", req.user);

    if (!req.user) {
      console.error("❌ Unauthorized: req.user is undefined");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const studentId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId: studentId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "materialUrl",
            "category",
          ],
          include: [
            {
              model: Lesson,
              as: "lessons",
              required: false,
              attributes: [
                "id",
                "title",
                "contentUrl",
                "videoUrl",
                "unitId",
                "isUnitHeader",
              ],
            },
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
              required: false,
            },
          ],
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    console.log("📦 Enrollments count:", enrollments.length);

    const courses = enrollments
      .map((entry, index) => {
        if (!entry.course) {
          console.warn(`⚠️ Enrollment ${index} has no course attached`);
          return null;
        }

        return {
          id: entry.course.id,
          slug: entry.course.slug,
          title: entry.course.title,
          description: entry.course.description,
          price: entry.course.price,
          materialUrl: entry.course.materialUrl,
          category: entry.course.category,
          teacher: entry.course.teacher || { name: "Unknown" },
          lessons: entry.course.lessons || [],
          status: entry.approved ? "approved" : "pending",
          enrolledAt: entry.accessGrantedAt,
        };
      })
      .filter(Boolean);

    return res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 getMyCourses ERROR:", error.stack || error.message);
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
