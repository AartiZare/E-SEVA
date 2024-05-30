import express from 'express';
import { validate } from '../middlewares/validate.js';
import { vendorValidation } from '../validations/index.js';
import { vendorController } from '../controllers/index.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router
  .route('/')
  .post(upload.single('profile_image'), validate(vendorValidation.createVendor), vendorController.createVendor)

export default router;
