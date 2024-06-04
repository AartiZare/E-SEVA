import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router
    .route('/')
    .get(auth(), dashboardController.fetchAllUserRecords);

router
    .route('/fetchRecords')
    .get(auth(), dashboardController.fetchUserRecords);

router
    .route('/dayActivity')
    .get(auth(), dashboardController.getDayActivity);

router
    .route('/myActivity')
    .get(auth(), dashboardController.getUserMonthlyActivity);

export default router;
