// controllers/adminController.js

const { User } = require("../models");

// 🚫 Get students pending approval
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { role: "student", approved: false },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Failed to fetch pending users." });
  }
};

// ✅ Approve student user
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found" });
    }

    user.approved = true;
    await user.save();

    res.status(200).json({ message: "User approved" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ error: "Failed to approve user." });
  }
};

// ❌ Reject student user (delete)
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found" });
    }

    await user.destroy();
    res.status(200).json({ message: "User rejected and deleted" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ error: "Failed to reject user." });
  }
};
