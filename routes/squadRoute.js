import express from 'express';
import { squadController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// router
//     .route('/evaluation/all')
//     .get(auth(), squadController.isSquad, squadController.fetchTotalEvaluation);

// router
//     .route('/daily-wise-doc')
//     .get(auth(), squadController.isSquad, squadController.fetchDailyWisePageDoc);

// router
//     .route('/team-data')
//     .get(auth(), squadController.isSquad, squadController.fetchTeamData);

// router
//     .route('/monthly-activity')
//     .get(auth(), squadController.isSquad, squadController.fetchMonthlyActivity);

// router
//     .route('/supervisors')
//     .get(auth(), squadController.isSquad, squadController.fetchSupervisorsForSquad);

router
    .route('/dashboard')
    .get(auth(), squadController.isSquad, squadController.fetchAllData);
    
export default router;