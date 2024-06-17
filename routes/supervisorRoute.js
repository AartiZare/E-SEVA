import express from "express";
import { supervisorController } from "../controllers/index.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// router
//     .route('/evaluation/all')
//     .get(auth(), supervisorController.isSupervisor, supervisorController.fetchAllUsersEvaluation);

// router
//     .route('/daily-wise-doc')
//     .get(auth(), supervisorController.isSupervisor, supervisorController.fetchDailyWisePageDoc);

// router
//     .route('/team-data')
//     .get(auth(), supervisorController.isSupervisor, supervisorController.fetchTeamData);

// router
//     .route('/activity-dates')
//     .get(auth(), supervisorController.isSupervisor, supervisorController.fetchSupervisorActivity);

// router
//     .route('/branches')
//     .get(auth(), supervisorController.isSupervisor, supervisorController.fetchBranchesForSupervisor);

router
  .route("/users")
  // Get all users for branch
  .get(
    auth(),
    supervisorController.isSupervisor,
    supervisorController.fetchUsersForBranch
  );

router
  .route("/dashboard")
  // Get all data for supervisor dashboard
  .get(
    auth(),
    supervisorController.isSupervisor,
    supervisorController.fetchAllSupervisorData
  );

export default router;
