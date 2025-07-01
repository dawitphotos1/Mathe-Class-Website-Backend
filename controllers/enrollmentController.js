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





const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { User, Course, UserCourseAccess } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

exports.confirmEnrollment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const user = req.user;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const metadata = session.metadata;
    const courseId = parseInt(metadata?.courseId);
    const metadataUserId = parseInt(metadata?.userId);

    if (!courseId || metadataUserId !== user.id) {
      return res.status(400).json({ error: "Invalid or mismatched metadata." });
    }

    const existing = await UserCourseAccess.findOne({
      where: { userId: user.id, courseId },
    });

    if (existing) {
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }

    await UserCourseAccess.create({
      userId: user.id,
      courseId,
      accessGrantedAt: new Date(),
      approved: false,
    });

    const course = await Course.findByPk(courseId);
    if (course) {
      const { subject, html } = courseEnrollmentPending(user, course);
      await sendEmail(user.email, subject, html);

      const admins = await User.findAll({ where: { role: "admin" } });
      for (const admin of admins) {
        const emailContent = enrollmentPendingAdmin(user, course);
        await sendEmail(admin.email, emailContent.subject, emailContent.html);
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Enrollment submitted for approval" });
  } catch (err) {
    console.error("Error confirming enrollment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ FIX: Add this method for /api/v1/enrollments/my-courses
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId, approved: true },
      include: {
        model: Course,
        as: "course",
        attributes: [
          "id",
          "title",
          "slug",
          "description",
          "thumbnail",
          "difficulty",
          "createdAt",
        ],
      },
    });

    const courses = enrollments.map((e) => e.course);

    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching my courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
