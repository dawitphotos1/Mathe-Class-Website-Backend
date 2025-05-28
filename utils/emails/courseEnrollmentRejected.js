module.exports = (user, course) => ({
  subject: `❌ Enrollment Rejected for ${course.title}`,
  html: `
    <p>Hello ${user.name},</p>
    <p>Your enrollment request for <strong>${course.title}</strong> has been <strong>rejected</strong>.</p>
    <p>If you believe this is a mistake, please contact your instructor.</p>
    <p>Best,<br/>MathClass Team</p>
  `,
});
