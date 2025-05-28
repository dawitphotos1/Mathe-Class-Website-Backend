// module.exports = (user, course) => ({
//   subject: `❌ Enrollment Rejected for ${course.title}`,
//   html: `
//     <p>Hello ${user.name},</p>
//     <p>Your enrollment request for <strong>${course.title}</strong> has been <strong>rejected</strong>.</p>
//     <p>If you believe this is a mistake, please contact your instructor.</p>
//     <p>Best,<br/>MathClass Team</p>
//   `,
// });




module.exports = (user, course) => {
  return {
    subject: `Enrollment Rejected for ${course.title}`,
    html: `
      <h2>Enrollment Rejected</h2>
      <p>Dear ${user.name},</p>
      <p>We regret to inform you that your enrollment request for the course <strong>${course.title}</strong> has been rejected.</p>
      <p>Please contact support at greenw17@yahoo.com for more information.</p>
      <p>Best regards,<br>Math Class Team</p>
    `,
  };
};