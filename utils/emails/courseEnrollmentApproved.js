module.exports = (user, course) => ({
  subject: `✅ Enrollment Approved for ${course.title}`,
  html: `
    <p>Hello ${user.name},</p>
    <p>Your enrollment in <strong>${course.title}</strong> has been <strong>approved</strong>.</p>
    <p>You may now access the course materials:</p>
    <a href="${process.env.FRONTEND_URL}/courses/${course.id}">Go to Course</a>
    <p>Regards,<br/>MathClass Team</p>
  `,
});
