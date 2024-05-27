import express from 'express';
import { validate } from '../middlewares/validate.js';
import { userValidation } from '../validations/index.js';
import { userController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router
.route('/forgot_password')
    .get(userController.forgotPassword);

router
.route('/reset_password')
    .post(userController.resetPassword);
    
router
.route('/verify_OTP')
    .get(userController.verifyOTP);

router
.route('/')
    .post(validate(userValidation.createUser), userController.create)
    .get(validate(userValidation.getAllUsers), userController.getAll);

router
.route('/:id')
    .put(validate(userValidation.updateUser), userController.update)
    .get(validate(userValidation.getOneUser), userController.getUserById);

router
.route('/login')
    .post(validate(userValidation.login), userController.login);
export default router;
