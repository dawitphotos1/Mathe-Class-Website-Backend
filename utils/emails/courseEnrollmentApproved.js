// module.exports = (user, course) => {
//   return {
//     subject: `Enrollment Confirmation for ${course.title}`,
//     html: `
//       <h2>Enrollment Confirmation</h2>
//       <p>Dear ${user.name},</p>
//       <p>Your enrollment for "${course.title}" is pending approval.</p>
//       <p>You will receive another email once your enrollment is approved by a teacher or admin.</p>
//       <p>Thank you for choosing our platform!</p>
//     `,
//   };
// };


// utils/emails/courseEnrollmentApproved.js

module.exports = (user, course) => {
  const subject = `Your enrollment in "${course.title}" is approved 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
      <h2>Hi ${user.name},</h2>
      <p>Good news! Your enrollment request for the course "<strong>${course.title}</strong>" has been <strong>approved</strong>.</p>
      <p>You now have access to the course. You can go to your dashboard and start learning:</p>
      <p>
        <a href="${process.env.FRONTEND_BASE_URL || "https://your-site.com"}/my-courses" 
           style="display:inline-block; padding:10px 15px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">
          Go to My Courses
        </a>
      </p>
      <p>If you have any questions or need help, reply to this email or contact support.</p>
      <hr />
      <p style="font-size:12px; color:#666;">
        Thank you for learning with us!<br/>
        — The Team
      </p>
    </div>
  `;
  return { subject, html };
};
