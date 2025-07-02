
// const { UserCourseAccess, Course, Lesson, User } = require("../models");

// exports.getMyCourses = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId: studentId },
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: [
//             "id",
//             "title",
//             "slug",
//             "description",
//             "price",
//             "materialUrl",
//             "category",
//           ],
//           include: [
//             {
//               model: Lesson,
//               as: "lessons",
//               required: false,
//               attributes: [
//                 "id",
//                 "title",
//                 "contentUrl",
//                 "videoUrl",
//                 "unitId",
//                 "isUnitHeader",
//               ],
//             },
//             {
//               model: User,
//               as: "teacher",
//               attributes: ["id", "name", "email"],
//               required: false,
//             },
//           ],
//         },
//       ],
//       order: [["accessGrantedAt", "DESC"]],
//     });

//     const courses = enrollments
//       .map((entry) => {
//         const course = entry.course;
//         if (!course) return null;

//         return {
//           id: course.id,
//           slug: course.slug,
//           title: course.title,
//           description: course.description,
//           price: course.price,
//           materialUrl: course.materialUrl,
//           category: course.category,
//           teacher: course.teacher || { name: "Unknown" },
//           lessons: course.lessons || [],
//           status: entry.approved ? "approved" : "pending",
//           enrolledAt: entry.accessGrantedAt,
//         };
//       })
//       .filter(Boolean);

//     return res.json({ success: true, courses });
//   } catch (error) {
//     console.error("🔥 Error in getMyCourses:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load courses",
//       details: error.message,
//     });
//   }
// };

// // ✅ Add this function at the end of the file:
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     if (!courseId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "courseId is required" });
//     }

//     const existing = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: "Already enrolled or pending approval",
//         });
//     }

//     const newEnrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       approved: false,
//       accessGrantedAt: new Date(),
//     });

//     return res.json({
//       success: true,
//       message: "Enrollment created and pending approval",
//       enrollment: newEnrollment,
//     });
//   } catch (error) {
//     console.error("🔥 Error in confirmEnrollment:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to confirm enrollment",
//       details: error.message,
//     });
//   }
// };


const { UserCourseAccess, Course, Lesson, User } = require("../models");

exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const enrollments = await UserCourseAccess.findAll({
      where: { userId: studentId },
      include: [
        {
          model: Course,
          as: "course",
          required: true, // Ensure only enrollments with courses
          attributes: [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "materialUrl",
            "category",
          ],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
              required: false,
            },
          ],
        },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    const courses = enrollments.map((entry) => {
      const course = entry.course;
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        price: course.price,
        materialUrl: course.materialUrl,
        category: course.category,
        teacher: course.teacher || { name: "Unknown" },
        status: entry.approved ? "approved" : "pending",
        enrolledAt: entry.accessGrantedAt,
      };
    });

    return res.json({ success: true, courses });
  } catch (error) {
    console.error("🔥 Error in getMyCourses:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load courses",
      details: error.message,
    });
  }
};

// ✅ Add this function at the end of the file:
exports.confirmEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "courseId is required" });
    }

    const existing = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Already enrolled or pending approval",
      });
    }

    const newEnrollment = await UserCourseAccess.create({
      userId,
      courseId,
      approved: false,
      accessGrantedAt: new Date(),
    });

    return res.json({
      success: true,
      message: "Enrollment created and pending approval",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("🔥 Error in confirmEnrollment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
      details: error.message,
    });
  }
};
