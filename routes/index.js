import express from 'express';
import userRoute from './userRoute';
import roleRoute from './roleRoute';
// import referralRoute from './referralRoute';
const router = express.Router();

// router.use('/referral', referralRoute);
router.use('/user', userRoute);
router.use('/role', roleRoute);

export default router;