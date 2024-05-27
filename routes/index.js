import express from 'express';
import userRoute from './userRoute.js';
import roleRoute from './roleRoute.js';
import branchRoute from './branchRoute.js';
// import referralRoute from './referralRoute';
const router = express.Router();

// router.use('/referral', referralRoute);
router.use('/user', userRoute);
router.use('/role', roleRoute);
router.use('/branch', branchRoute);

export default router;