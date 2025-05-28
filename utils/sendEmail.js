
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: true, // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("📬 SMTP connection successful");
  }
});

async function sendEmail(to, subject, html) {
  if (!to || !subject || !html) {
    console.warn("❌ sendEmail: Missing to, subject, or html content");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
}

module.exports = sendEmail;
