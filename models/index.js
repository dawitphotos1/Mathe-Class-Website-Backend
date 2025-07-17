
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model initializers
const initUser = require("./User");
const initCourse = require("./Course");
const initLesson = require("./Lesson");
const initUserCourseAccess = require("./UserCourseAccess");
const initLessonCompletion = require("./lessoncompletion");
const initLessonProgress = require("./lessonProgress");

// Step 1: Initialize all models
const models = {
  User: initUser(sequelize, DataTypes),
  Course: initCourse(sequelize, DataTypes),
  Lesson: initLesson(sequelize, DataTypes),
  UserCourseAccess: initUserCourseAccess(sequelize, DataTypes),
  LessonCompletion: initLessonCompletion(sequelize, DataTypes),
  LessonProgress: initLessonProgress(sequelize, DataTypes),
};

// ✅ Step 2: Automatically apply all associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Step 3: Add sequelize and Sequelize to export
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Step 4: Export all models
module.exports = models;



// import axios from "axios";
// import { API_BASE_URL } from "../config/db";

// // Set default base URL for axios
// axios.defaults.baseURL = API_BASE_URL;
// axios.defaults.withCredentials = true;

// // Axios interceptor for handling responses and errors
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.log("Interceptor triggered:", {
//       url: error.config?.url,
//       method: error.config?.method,
//       data: error.config?.data,
//     });
//     if (error.response) {
//       console.error("Response error:", {
//         status: error.response.status,
//         data: error.response.data,
//         url: error.config.url,
//         headers: error.response.headers,
//       });
//       if (error.response.status === 401) {
//         console.error("Unauthorized access - redirecting to login");
//         // Optionally redirect to login page
//         // window.location.href = '/login';
//       } else if (error.response.status === 404) {
//         console.error("Resource not found:", error.config.url);
//       } else if (error.response.status === 500) {
//         console.error(
//           "Server error:",
//           error.response.data?.details || error.message
//         );
//       }
//     } else if (error.request) {
//       console.error("Network error detected:", {
//         message: error.message,
//         code: error.code,
//       });
//     } else {
//       console.error("Error setting up request:", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// export default axios;