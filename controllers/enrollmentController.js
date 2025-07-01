
// const { UserCourseAccess, Course, Lesson, User } = require("../models");

// // ✅ GET courses the student is enrolled in
// exports.getMyCourses = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     const enrollments = await UserCourseAccess.findAll({
//       where: { userId: studentId, approved: true },
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
//       .map((entry) => entry.course)
//       .filter(Boolean)
//       .map((course) => ({
//         id: course.id,
//         slug: course.slug,
//         title: course.title,
//         description: course.description,
//         price: course.price,
//         materialUrl: course.materialUrl,
//         category: course.category,
//         teacher: course.teacher || { name: "Unknown" },
//         lessons: course.lessons || [],
//       }));

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

// // ✅ POST confirmEnrollment (student confirms enrollment after payment)
// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.body;

//     if (!courseId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Course ID is required" });
//     }

//     const existing = await UserCourseAccess.findOne({
//       where: { userId, courseId },
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         error: "You are already enrolled in this course",
//       });
//     }

//     const enrollment = await UserCourseAccess.create({
//       userId,
//       courseId,
//       approved: false, // Admin/teacher approves later
//       accessGrantedAt: new Date(),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Enrollment submitted and pending approval",
//       enrollment,
//     });
//   } catch (error) {
//     console.error("❌ Error confirming enrollment:", error);
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
      where: { userId: studentId }, // fetch all, including pending
      include: [
        {
          model: Course,
          as: "course",
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
              model: Lesson,
              as: "lessons",
              required: false,
              attributes: [
                "id",
                "title",
                "contentUrl",
                "videoUrl",
                "unitId",
                "isUnitHeader",
              ],
            },
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

    const courses = enrollments
      .map((entry) => {
        const course = entry.course;
        if (!course) return null;

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          price: course.price,
          materialUrl: course.materialUrl,
          category: course.category,
          teacher: course.teacher || { name: "Unknown" },
          lessons: course.lessons || [],
          status: entry.approved ? "approved" : "pending", // ✅ frontend needs this
          enrolledAt: entry.accessGrantedAt,
        };
      })
      .filter(Boolean); // remove nulls

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
