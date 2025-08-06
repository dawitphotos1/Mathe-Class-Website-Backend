// src/controllers/adminController.js
const { User } = require("../models");

// Fetch all student users that are not yet approved
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: {
        role: "student",
        approved: false,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Failed to fetch pending users." });
  }
};

// Approve a student user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found." });
    }
    user.approved = true;
    await user.save();
    res.status(200).json({ message: "User approved." });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ error: "Failed to approve user." });
  }
};

// Reject and delete a student user
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found." });
    }
    await user.destroy();
    res.status(200).json({ message: "User rejected and deleted." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ error: "Failed to reject user." });
  }
};


// routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const enrollmentController = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Require admin role
router.use(authenticate);
router.use(authorize("admin"));

// User approval endpoints
router.get("/pending-users", adminController.getPendingUsers);
router.patch("/approve-user/:id", adminController.approveUser);
router.patch("/reject-user/:id", adminController.rejectUser);

// Enrollment approval endpoints
router.get("/enrollments/pending", enrollmentController.getPendingEnrollments);
router.get("/enrollments/approved", enrollmentController.getApprovedEnrollments);
router.put("/enrollments/:id/approve", enrollmentController.approveEnrollment);
router.delete("/enrollments/:id", enrollmentController.rejectEnrollment);

module.exports = router;
