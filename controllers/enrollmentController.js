
// const sequelize = require("../config/db");
// const { QueryTypes } = require("sequelize");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.confirmEnrollment = async (req, res) => {
//   const { session_id } = req.body;
//   const userId = req.user.id;

//   try {
//     if (!session_id) {
//       return res.status(400).json({ error: "Missing Stripe session ID." });
//     }

//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     if (!session || session.payment_status !== "paid") {
//       return res.status(400).json({ error: "Payment not completed." });
//     }

//     const metadata = session.metadata;
//     const courseId = parseInt(metadata?.courseId);
//     const stripeUserId = parseInt(metadata?.userId);

//     if (!courseId || !stripeUserId || stripeUserId !== userId) {
//       return res.status(400).json({ error: "Invalid or mismatched metadata." });
//     }

//     const existing = await sequelize.query(
//       `SELECT * FROM "UserCourseAccess" WHERE "userId" = :userId AND "courseId" = :courseId`,
//       {
//         replacements: { userId, courseId },
//         type: QueryTypes.SELECT,
//       }
//     );

//     if (existing.length > 0) {
//       return res.status(200).json({ success: true, message: "Already enrolled" });
//     }

//     await sequelize.query(
//       `INSERT INTO "UserCourseAccess" ("userId", "courseId", "accessGrantedAt", "createdAt", "updatedAt") VALUES (:userId, :courseId, NOW(), NOW(), NOW())`,
//       {
//         replacements: { userId, courseId },
//         type: QueryTypes.INSERT,
//       }
//     );

//     res.status(200).json({ success: true, message: "Enrollment confirmed." });
//   } catch (err) {
//     console.error("Enrollment error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




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

    const metadata = session.metadata;
    const courseId = parseInt(metadata?.courseId);
    const stripeUserId = parseInt(metadata?.userId);

    if (!courseId || !stripeUserId || stripeUserId !== userId) {
      return res.status(400).json({ error: "Invalid or mismatched metadata." });
    }

    const existing = await sequelize.query(
      `SELECT * FROM "UserCourseAccess" WHERE "userId" = :userId AND "courseId" = :courseId`,
      {
        replacements: { userId, courseId },
        type: QueryTypes.SELECT,
      }
    );

    if (existing.length > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }

    await sequelize.query(
      `INSERT INTO "UserCourseAccess" ("userId", "courseId", "accessGrantedAt", "createdAt", "updatedAt", "approved") VALUES (:userId, :courseId, NOW(), NOW(), NOW(), false)`,
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

// ✅ NEW FUNCTION: Approve course enrollment by admin
exports.approveEnrollment = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing userId or courseId" });
    }

    const result = await sequelize.query(
      `UPDATE "UserCourseAccess" SET "approved" = true, "updatedAt" = NOW() 
       WHERE "userId" = :userId AND "courseId" = :courseId 
       RETURNING *`,
      {
        replacements: { userId, courseId },
        type: QueryTypes.UPDATE,
      }
    );

    if (result[1] === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.status(200).json({ success: true, message: "Enrollment approved." });
  } catch (err) {
    console.error("Enrollment approval error:", err);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
};
