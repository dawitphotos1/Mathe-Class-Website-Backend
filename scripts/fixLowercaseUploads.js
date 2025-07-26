// // scripts/fixLowercaseUploads.js
// const { Lesson } = require("../models");
// const sequelize = require("../models").sequelize;
// const { Op } = require("sequelize");

// async function fixUploadsCasing() {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ DB connected");

//     const lessons = await Lesson.findAll({
//       where: {
//         contentUrl: {
//           [Op.iLike]: "%/uploads/%",
//         },
//       },
//     });

//     if (lessons.length === 0) {
//       console.log("✅ No lowercase /uploads/ URLs found.");
//       return;
//     }

//     console.log(`🔍 Found ${lessons.length} lessons to update`);

//     for (const lesson of lessons) {
//       const fixedUrl = lesson.contentUrl.replace(/^\/uploads/i, "/Uploads");
//       if (fixedUrl !== lesson.contentUrl) {
//         console.log(`🔧 Updating: ${lesson.contentUrl} → ${fixedUrl}`);
//         lesson.contentUrl = fixedUrl;
//         await lesson.save();
//       }
//     }

//     console.log("✅ All lowercase URLs fixed.");
//   } catch (error) {
//     console.error("❌ Error fixing URLs:", error.message);
//   } finally {
//     await sequelize.close();
//   }
// }

// fixUploadsCasing();



const { sequelize, Lesson, Course } = require("../models");
const { Op } = require("sequelize");

async function fixUploadsCasing() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // === LESSONS ===
    const lessons = await Lesson.findAll({
      where: {
        contentUrl: {
          [Op.iLike]: "%/uploads/%",
        },
      },
    });

    for (const lesson of lessons) {
      const fixedUrl = lesson.contentUrl.replace(/^\/uploads/i, "/Uploads");
      if (fixedUrl !== lesson.contentUrl) {
        console.log(
          `📘 Lesson ${lesson.id}: ${lesson.contentUrl} → ${fixedUrl}`
        );
        lesson.contentUrl = fixedUrl;
        await lesson.save();
      }
    }

    // === COURSES ===
    const courses = await Course.findAll({
      where: {
        [Op.or]: [
          { attachmentUrls: { [Op.ne]: null } },
          { thumbnailUrl: { [Op.iLike]: "%/uploads/%" } },
        ],
      },
    });

    for (const course of courses) {
      let updated = false;

      // ✅ Fix attachments
      if (Array.isArray(course.attachmentUrls)) {
        const fixedAttachments = course.attachmentUrls.map((url) => {
          const fixed = url.replace(/^\/uploads/i, "/Uploads");
          if (fixed !== url) updated = true;
          return fixed;
        });
        course.attachmentUrls = fixedAttachments;
      }

      // ✅ Fix thumbnail
      if (course.thumbnailUrl && course.thumbnailUrl.match(/^\/uploads/i)) {
        course.thumbnailUrl = course.thumbnailUrl.replace(
          /^\/uploads/i,
          "/Uploads"
        );
        updated = true;
      }

      if (updated) {
        console.log(`📗 Course ${course.id} updated`);
        await course.save();
      }
    }

    console.log("✅ Fix completed for lessons and courses.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

fixUploadsCasing();
