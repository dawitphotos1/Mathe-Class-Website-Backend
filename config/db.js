
// config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connection established"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

module.exports = sequelize;
