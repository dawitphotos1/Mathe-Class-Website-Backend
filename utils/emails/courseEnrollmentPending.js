module.exports = function courseEnrollmentPending(user, course) {
  return {
    subject: `✅ Enrollment Received for ${course.title}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">🎉 Enrollment Confirmation</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
  
          <p>Thank you for your payment! You have successfully enrolled in the course:</p>
  
          <h3 style="color: #3498db;">${course.title}</h3>
  
          <p>📚 Description: ${
            course.description || "No course description available."
          }</p>
          <p>💲 Paid: $${course.price}</p>
  
          <p>Your enrollment is currently <strong>pending approval</strong> from a teacher or admin. You will be notified once it has been reviewed.</p>
  
          <hr style="border: none; border-top: 1px solid #ccc;" />
  
          <p>If you have any questions or need assistance, feel free to <a href="${
            process.env.FRONTEND_URL
          }/support">contact our support team</a>.</p>
  
          <p style="margin-top: 2rem;">Best regards,<br/>The Mathematics Class Team</p>
        </div>
      `,
  };
};
