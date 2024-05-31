import express from 'express';
import { validate } from '../middlewares/validate.js';
import * as documentValidation from '../validations/documentValidations.js';
import * as documentController from '../controllers/documentController.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router
  .route('/')
  .post(auth(), upload.single('image_pdf'), validate(documentValidation.createDocument), documentController.createDocument)
  .get(auth(), documentController.pendingDocumentListUser);

router
  .route('/:documentId')
  .put(auth(), documentController.approveDocument);

export default router;
