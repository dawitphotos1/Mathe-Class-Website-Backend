module.exports = (student, feedback, teacher) => ({
  subject: `📬 New Feedback from ${teacher.name}`,
  html: `
    <p>Hello ${student.name},</p>
    <p>You received new feedback from <strong>${teacher.name}</strong>:</p>
    <blockquote>${feedback}</blockquote>
    <p>Check your dashboard to view it.</p>
    <p>Best regards,<br/>MathClass Team</p>
  `,
});
