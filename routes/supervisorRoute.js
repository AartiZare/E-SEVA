import express from 'express';
import * as supervisorController from '../controllers/supervisorController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router
    .route('/evaluation/all')
    .get(auth(), supervisorController.isSupervisor, supervisorController.fetchAllUsersEvaluation);

router
    .route('/evaluation/filtered')
    .get(auth(), supervisorController.isSupervisor, supervisorController.fetchFilteredEvaluation);

router
    .route('/daily-wise-doc')
    .get(auth(), supervisorController.isSupervisor, supervisorController.fetchDailyWisePageDoc);

router
    .route('/team-data')
    .get(auth(), supervisorController.isSupervisor, supervisorController.fetchTeamData);

router
    .route('/activity-dates')
    .get(auth(), supervisorController.isSupervisor, supervisorController.getSupvervisorActivity);

export default router;
