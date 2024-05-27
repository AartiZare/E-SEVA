import express from 'express';
import { validate } from '../middlewares/validate.js';
import { roleValidation } from '../validations/index.js';
import { roleController } from '../controllers/index.js';

const router = express.Router();

router
.route('/')
    .post(validate(roleValidation.create), roleController.create)
    .get(validate(roleValidation.getAllRoles), roleController.getAllRole);
export default router;

