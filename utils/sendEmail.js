// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail", // Or use your SMTP service
//   auth: {
//     user: process.env.EMAIL_USER, // Gmail address or SMTP user
//     pass: process.env.EMAIL_PASS, // App password or SMTP password
//   },
// });

// async function sendEmail(to, subject, html) {
//   const mailOptions = {
//     from: `"MathClass Team" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("📬 Email sent to", to);
//   } catch (err) {
//     console.error("❌ Email failed:", err);
//   }
// }

// module.exports = sendEmail;



const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📬 Email sent to", to);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
}

module.exports = sendEmail;
