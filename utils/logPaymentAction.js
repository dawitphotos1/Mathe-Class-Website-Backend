// const fs = require("fs");
// const path = require("path");

// const logPaymentAction = (action, data, user) => {
//   const line = `[${new Date().toISOString()}] ${action} by ${
//     user?.email || "system"
//   } courseId:${data.courseId}, amount:${data.coursePrice}\n`;
//   const filePath = path.join(__dirname, "../logs/payment-actions.log");

//   fs.appendFile(filePath, line, (err) => {
//     if (err) console.error("❌ Failed to log payment:", err.message);
//   });
// };

// module.exports = logPaymentAction;



const fs = require("fs");
const path = require("path");

const logPaymentAction = (action, data, user) => {
  const logLine = `[${new Date().toISOString()}] ${action} by ${
    user?.email || "system"
  } courseId:${data.courseId}, amount:${data.coursePrice}\n`;
  const logPath = path.join(__dirname, "../logs/payment-actions.log");

  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error("❌ Payment log error:", err.message);
  });
};

module.exports = logPaymentAction;
