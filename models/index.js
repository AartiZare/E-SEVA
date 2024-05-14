import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/dbConfig";
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