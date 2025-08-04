// const nodemailer = require("nodemailer");

// // Create a transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Or use 'hotmail', 'outlook', or custom SMTP
//   auth: {
//     user: process.env.EMAIL_USER, // Your email address (set in .env)
//     pass: process.env.EMAIL_PASS, // App password (not your main password)
//   },
// });

// /**
//  * Send a welcome email to a student
//  * @param {String} toEmail - Student's email
//  * @param {String} studentName - Student's name
//  */
// const sendWelcomeEmail = async (toEmail, studentName) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: toEmail,
//       subject: "Welcome to the Math Class!",
//       html: `<h2>Hello ${studentName},</h2>
//              <p>Welcome to the Math Class Website. Your registration was successful and is pending approval.</p>
//              <p>We’re excited to have you on board!</p>
//              <p>Best regards,<br/>The Math Class Team</p>`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Welcome email sent to ${toEmail}`);
//   } catch (error) {
//     console.error(`❌ Failed to send welcome email:`, error.message);
//   }
// };

// module.exports = sendWelcomeEmail;



// utils/emails/welcomeStudent.js

module.exports = function (studentName) {
  return {
    subject: "Welcome to the Math Class!",
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Welcome to the Math Class Website. Your registration was successful and is pending approval.</p>
      <p>We’re excited to have you on board!</p>
      <p>Best regards,<br/>The Math Class Team</p>
    `
  };
};
