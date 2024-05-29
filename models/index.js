import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/dbConfig.js";
import userModel from "./userModel.js";
import roleModel from "./roleModel.js";
import branchModel from "./branchModel.js";
import userBranchModel from "./userBranchModel.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

const models = {
  Users: userModel(sequelize, DataTypes),
  Roles: roleModel(sequelize, DataTypes),
  Branch: branchModel(sequelize, DataTypes),
  UserBranch: userBranchModel(sequelize, DataTypes),
};

const db = {
  Sequelize,
  sequelize,
  ...models,  // Spread all models into db object
};

sequelize.sync({ force: false })
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
});

export default db;