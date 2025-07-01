// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const { User, Course, UserCourseAccess } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
// const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     const user = req.user;

//     if (!session_id) {
//       return res.status(400).json({ error: "Missing session ID" });
//     }

//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (!session || session.payment_status !== "paid") {
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     const metadata = session.metadata;
//     const courseId = parseInt(metadata?.courseId);
//     const metadataUserId = parseInt(metadata?.userId);

//     if (!courseId || metadataUserId !== user.id) {
//       return res.status(400).json({ error: "Invalid or mismatched metadata." });
//     }

//     // Check if already enrolled
//     const existing = await UserCourseAccess.findOne({
//       where: { userId: user.id, courseId },
//     });

//     if (existing) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Already enrolled" });
//     }

//     // Create pending enrollment
//     await UserCourseAccess.create({
//       userId: user.id,
//       courseId,
//       accessGrantedAt: new Date(),
//       approved: false,
//     });
//     console.log("✅ Enrollment saved with approved = false");
 
//     const course = await Course.findByPk(courseId);
//     if (course) {
//       const { subject, html } = courseEnrollmentPending(user, course);
//       await sendEmail(user.email, subject, html);

//       // Notify admins
//       const admins = await User.findAll({ where: { role: "admin" } });
//       for (const admin of admins) {
//         const emailContent = enrollmentPendingAdmin(user, course);
//         await sendEmail(admin.email, emailContent.subject, emailContent.html);
//       }
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Enrollment submitted for approval" });
//   } catch (err) {
//     console.error("Error confirming enrollment:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


const { Enrollment, Course, Unit, Lesson, User } = require("../models");

// CONFIRM ENROLLMENT
exports.confirmEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "Course ID is required" });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Already enrolled in this course" });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      status: "confirmed", // or "active" if that's your logic
    });

    res
      .status(201)
      .json({ success: true, message: "Enrollment confirmed", enrollment });
  } catch (error) {
    console.error("Error in confirmEnrollment:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Enrollment failed",
        details: error.message,
      });
  }
};

// GET MY COURSES (for students)
exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId: studentId },
      include: [
        {
          model: Course,
          include: [
            {
              model: Unit,
              include: [Lesson],
              required: false,
            },
            {
              model: User, // Teacher
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!enrollments || enrollments.length === 0) {
      return res.json({ success: true, courses: [] });
    }

    const courses = enrollments
      .map((enrollment) => enrollment.Course)
      .filter(Boolean)
      .map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        materialUrl: course.materialUrl || null,
        teacher: course.teacher || { name: "Unknown" },
        units:
          course.Units?.map((unit) => ({
            id: unit.id,
            unitName: unit.unitName,
            lessons:
              unit.Lessons?.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                contentUrl: lesson.contentUrl || null,
                videoUrl: lesson.videoUrl || null,
              })) || [],
          })) || [],
      }));

    res.json({ success: true, courses });
  } catch (error) {
    console.error("Error in getMyCourses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch enrolled courses",
      details: error.message,
    });
  }
};
