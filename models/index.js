const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const basename = path.basename(__filename);
const db = {};

// Load all model files in this folder (except index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const filePath = path.join(__dirname, file);
    const importedModel = require(filePath);

    // Support both class-style and function-style model definitions
    const model =
      typeof importedModel === "function"
        ? importedModel(sequelize, Sequelize.DataTypes)
        : importedModel.init
        ? importedModel
        : null;

    if (model) {
      db[model.name] = model;
    } else {
      console.warn(`⚠️ Could not load model from file: ${file}`);
    }
  });

// Setup associations
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// Add Sequelize instance to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

