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

// scripts/fixLowercaseUploads.js

const { sequelize, Course } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const courses = await Course.findAll();
    for (const course of courses) {
      let updated = false;

      const fixedAttachments = (course.attachmentUrls || []).map((url) => {
        if (url.startsWith("/uploads/")) {
          updated = true;
          return url.replace("/uploads/", "/Uploads/");
        }
        return url;
      });

      if (updated) {
        await course.update({ attachmentUrls: fixedAttachments });
        console.log(`✅ Updated course ID ${course.id}`);
      }
    }

    console.log("✅ All lowercase URLs fixed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
})();
