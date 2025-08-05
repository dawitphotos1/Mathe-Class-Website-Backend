const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends an email.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - Email HTML content.
 */
const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.warn("❌ Email send skipped: missing parameters", {
      to,
      subject,
      html,
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Mathe Class" <support@matheclass.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
                                