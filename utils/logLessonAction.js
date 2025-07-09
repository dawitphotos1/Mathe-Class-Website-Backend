// const fs = require("fs");
// const path = require("path");

// const logLessonAction = (action, lesson, user) => {
//   const log = `[${new Date().toISOString()}] ${action} by ${
//     user?.email || "system"
//   } on "${lesson.title}" (ID: ${lesson.id})\n`;
//   fs.appendFile(
//     path.join(__dirname, "../logs/lesson-actions.log"),
//     log,
//     (err) => {
//       if (err) console.error("⚠️ Audit log error:", err.message);
//     }
//   );
// };

// module.exports = logLessonAction;


const fs = require("fs");
const path = require("path");

// ✅ Set up path to /logs/lesson-actions.log
const logsDir = path.join(__dirname, "../logs");
const logFilePath = path.join(logsDir, "lesson-actions.log");

// ✅ Ensure logs folder exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ Reusable logging function
const logLessonAction = (action, lesson, user) => {
  const logMsg = `[${new Date().toISOString()}] ${action} by ${
    user?.email || "system"
  } on "${lesson.title}" (ID: ${lesson.id})\n`;

  fs.appendFile(logFilePath, logMsg, (err) => {
    if (err) {
      console.error("❌ Failed to write lesson audit log:", err);
    }
  });
};

module.exports = logLessonAction;
