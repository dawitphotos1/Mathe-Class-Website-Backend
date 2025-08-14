// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// /**
//  * Sends an email.
//  * @param {string} to - Recipient email address.
//  * @param {string} subject - Email subject.
//  * @param {string} html - Email HTML content.
//  */
// const sendEmail = async (to, subject, html) => {
//   if (!to || !subject || !html) {
//     console.warn("❌ Email send skipped: missing parameters", {
//       to,
//       subject,
//       html,
//     });
//     return;
//   }

//   try {
//     await transporter.sendMail({
//       from: '"Mathe Class" <support@matheclass.com>',
//       to,
//       subject,
//       html,
//     });
//     console.log(`📧 Email sent to ${to}`);
//   } catch (error) {
//     console.error("❌ Error sending email:", error.message);
//     throw error;
//   }
// };

// module.exports = sendEmail;
                                




const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // smtp.mail.yahoo.com
  port: parseInt(process.env.MAIL_PORT, 10), // 465 for SSL
  secure: true, // SSL/TLS
  auth: {
    user: process.env.MAIL_USER, // greenw17@yahoo.com
    pass: process.env.MAIL_PASS, // Yahoo app password
  },
});

/**
 * Sends an email and returns true if successful, false if failed.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - Email HTML content.
 * @returns {Promise<boolean>}
 */
const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.warn("❌ Email send skipped: missing parameters", {
      to,
      subject,
      html,
    });
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed (non-blocking):", error.message);
    return false;
  }
};

module.exports = sendEmail;
