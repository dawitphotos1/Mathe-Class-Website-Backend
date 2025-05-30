const express = require("express");
const router = express.Router();
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");

// Dev-only preview route
router.get("/preview-enrollment-email", (req, res) => {
  const sampleUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  const sampleCourse = {
    title: "Algebra 1",
    description:
      "Introduction to Algebra covering variables, equations, and more.",
    price: 1200,
  };

  const { html } = courseEnrollmentPending(sampleUser, sampleCourse);
  res.send(html);
});

module.exports = router;
