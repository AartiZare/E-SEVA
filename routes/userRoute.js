import express from 'express';
import { validate } from '../middlewares/validate.js';
import { userValidation } from '../validations/index.js';
import { userController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router
.route('/forgot_password')
    .post(userController.forgotPassword);

router
.route('/reset_password')
    .post(userController.resetPassword);

router
.route('/set-password')
    .post(userController.set_password);

router
.route('/verify_OTP')
    .post(userController.verifyOTP);

// router
// .route('/')
//     .post(validate(userValidation.createUser), userController.create)
//     .get(validate(userValidation.getAllUsers), userController.getAll);
router
  .route('/')
  .post(auth(), upload.single('profile_image'), validate(userValidation.createUser), userController.create)
  .get(validate(userValidation.getAllUsers), userController.getAll);

router
.route('/:id')
    .put(upload.single('profile_image'), validate(userValidation.updateUser), userController.update)
    .get(validate(userValidation.getOneUser), userController.getUserById);

router
.route('/login')
    .post(validate(userValidation.login), userController.login);
export default router;

router
  .route('/contact_us')
  .post(auth(),userController.contactUs); 