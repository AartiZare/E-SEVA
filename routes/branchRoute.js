import express from 'express';
import { validate } from '../middlewares/validate.js';
import * as branchValidation from '../validations/branchValidation.js';
import * as branchController from '../controllers/branchController.js';

const router = express.Router();

router
  .route('/')
  .post(validate(branchValidation.createBranch), branchController.createBranch)
  .get(branchController.getAllBranches);

export default router;
