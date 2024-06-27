import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/dbConfig.js";
import userModel from "./userModel.js";
import roleModel from "./roleModel.js";
import branchModel from "./branchModel.js";
import documentsModel from "./documentModel.js";
import vendorModel from "./vendorModel.js";
import activityModel from "./activityModel.js";
import stateModel from "./stateModel.js";
import divisionModel from "./divisionModel.js";
import districtModel from "./districtModel.js";
import talukModel from "./talukModel.js";
import documentTypeModel from "./documentTypeModel.js";
import designationModel from "./designationModel.js";
import feedbackModel from "./feedbackModel.js";
import userStateToBranchModel from "./userStateToBranchModel.js";
import NotificationModel from "./notificationModel.js";

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
  Activity: activityModel(sequelize, DataTypes),
  Branch: branchModel(sequelize, DataTypes),
  Designation: designationModel(sequelize, DataTypes),
  District: districtModel(sequelize, DataTypes),
  Division: divisionModel(sequelize, DataTypes),
  Document: documentsModel(sequelize, DataTypes),
  DocumentType: documentTypeModel(sequelize, DataTypes),
  Feedback: feedbackModel(sequelize, DataTypes),
  Role: roleModel(sequelize, DataTypes),
  State: stateModel(sequelize, DataTypes),
  Taluk: talukModel(sequelize, DataTypes),
  User: userModel(sequelize, DataTypes),
  UserStateToBranch: userStateToBranchModel(sequelize, DataTypes),
  Vendor: vendorModel(sequelize, DataTypes),
  Notification: NotificationModel(sequelize, DataTypes)
};

const db = {
  Sequelize,
  sequelize,
  ...models, // Spread all models into db object
};

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

export default db;
