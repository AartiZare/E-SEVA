import express from 'express';
import { validate } from '../middlewares/validate';
import { roleValidation } from '../validations';
import { roleController } from '../controllers';

const router = express.Router();

router
.route('/')
    .post(validate(roleValidation.create), roleController.create)
    .get(validate(roleValidation.getAllRoles), roleController.getAllRole);
export default router;

