module.exports = (user, course) => {
  return {
    subject: `Enrollment Confirmation for ${course.title}`,
    html: `
      <h2>Enrollment Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your enrollment for "${course.title}" is pending approval.</p>
      <p>You will receive another email once your enrollment is approved by a teacher or admin.</p>
      <p>Thank you for choosing our platform!</p>
    `,
  };
};
