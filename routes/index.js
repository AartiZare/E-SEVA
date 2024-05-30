import express from 'express';
import userRoute from './userRoute.js';
import roleRoute from './roleRoute.js';
import branchRoute from './branchRoute.js';
import documentRoute from './documentRoute.js';
import vendorRoute from './vendorRoute.js';
import activityRoute from './activityRoute.js';
const router = express.Router();

router.use('/user', userRoute);
router.use('/role', roleRoute);
router.use('/branch', branchRoute);
router.use('/document', documentRoute);
router.use('/vendor', vendorRoute);
router.use('/activity', activityRoute);

export default router;