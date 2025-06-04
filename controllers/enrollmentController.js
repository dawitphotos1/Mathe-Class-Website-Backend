// const Stripe = require("stripe");
// const pool = require("../config/db"); // assuming you're using pg pool
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     if (!session_id) {
//       return res.status(400).json({ error: "Missing session_id" });
//     }

//     // Retrieve session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (!session || session.payment_status !== "paid") {
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     // Get metadata: you must have passed these when creating the session
//     const userId = session.metadata?.userId;
//     const courseId = session.metadata?.courseId;

//     if (!userId || !courseId) {
//       return res
//         .status(400)
//         .json({ error: "Missing metadata from Stripe session" });
//     }

//     // Check if access already exists
//     const check = await pool.query(
//       "SELECT * FROM UserCourseAccess WHERE userId = $1 AND courseId = $2",
//       [userId, courseId]
//     );

//     if (check.rows.length > 0) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Already enrolled" });
//     }

//     // Insert into UserCourseAccess
//     await pool.query(
//       `INSERT INTO UserCourseAccess (userId, courseId, accessGrantedAt, createdAt, updatedAt)
//        VALUES ($1, $2, NOW(), NOW(), NOW())`,
//       [userId, courseId]
//     );

//     return res.status(200).json({ success: true });
//   } catch (err) {
//     console.error("❌ Error confirming enrollment:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };



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

