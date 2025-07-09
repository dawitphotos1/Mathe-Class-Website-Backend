const path = require("path");
const fs = require("fs");
const { Course } = require("../models");

// ✅ Create new course (teacher only)
exports.createCourse = async (req, res) => {
  try {
    console.log("📥 CREATE COURSE request received.");
    console.log("🔐 Authenticated user:", req.user);
    console.log("📝 Incoming fields:", req.body);
    console.log("📎 Incoming files:", req.files);

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
    } = req.body;

    if (!title || !slug || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, slug, description, category",
      });
    }

    const attachmentUrls = [];
    if (req.files?.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        fs.writeFileSync(filePath, file.buffer);
        attachmentUrls.push(`/uploads/${fileName}`);
      }
    }

    const course = await Course.create({
      title,
      description,
      category,
      slug,
      price: parseFloat(price),
      materialUrl,
      attachmentUrls,
      teacherId: req.user.id,
    });

    console.log("✅ Course created:", course.id);
    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("🔥 CREATE COURSE ERROR:", error.stack || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
};
