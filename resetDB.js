require("dotenv").config();
const { sequelize } = require("./models");

(async () => {
  try {
    console.log("⏳ Resetting database...");
    await sequelize.sync({ force: true }); // DANGEROUS in production
    console.log("✅ Database reset: All tables dropped and recreated.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting database:", err);
    process.exit(1);
  }
})();
