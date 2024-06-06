import express from 'express';
import { dashboardController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router
    .route('/')
    .get(auth(), dashboardController.fetchAllUserData);

// router
//     .route('/fetchRecords')
//     .get(auth(), dashboardController.fetchUserRecords);

// router
//     .route('/dayActivity')
//     .get(auth(), dashboardController.getDayActivity);

// router
//     .route('/myActivity')
//     .get(auth(), dashboardController.getUserMonthlyActivity);

export default router;
