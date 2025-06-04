
// controllers/enrollmentController.js
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.confirmEnrollment = async (req, res) => {
  const { session_id } = req.body;
  const userId = req.user.id;

  try {
    if (!session_id) {
      return res.status(400).json({ error: "Missing Stripe session ID." });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed." });
    }

    const courseId = session.metadata?.courseId;

    if (!courseId) {
      return res.status(400).json({ error: "Missing course ID in session metadata." });
    }

    // Check if user is already enrolled
    const existing = await sequelize.query(
      `SELECT * FROM "UserCourseAccess" WHERE "userId" = :userId AND "courseId" = :courseId`,
      {
        replacements: { userId, courseId },
        type: QueryTypes.SELECT,
      }
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "You are already enrolled in this course." });
    }

    await sequelize.query(
      `INSERT INTO "UserCourseAccess" ("userId", "courseId", "accessGrantedAt", "createdAt", "updatedAt")
       VALUES (:userId, :courseId, NOW(), NOW(), NOW())`,
      {
        replacements: { userId, courseId },
        type: QueryTypes.INSERT,
      }
    );

    res.status(200).json({ success: true, message: "Enrollment confirmed." });

  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

