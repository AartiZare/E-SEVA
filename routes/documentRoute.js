import express from 'express';
import { validate } from '../middlewares/validate.js';
import * as documentValidation from '../validations/documentValidations.js';
import * as documentController from '../controllers/documentController.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.route('/file')
    .get(documentController.getDocFileByDocId);

router
  .route('/completeDocList')
  .get(auth(), documentController.getDocumentList);

router
  .route('/')
  .post(auth(), upload.single('image_pdf'), validate(documentValidation.createDocument), documentController.createDocument)
  .get(auth(), documentController.pendingDocumentListUser);

router
  .route('/rejectedList')
  .get(auth(), documentController.rejectedDocumentListUser);

router
  .route('/documentListUser')
  .get(auth(), documentController.getDocumentListUser);

router
  .route('/:documentId')
  .get(auth(), documentController.getDocumentById)
  .put(auth(), documentController.approveDocument);

router
  .route('/rejecteDoc/:documentId')
  .put(auth(), documentController.rejectDocument);


router.route('/updateDocument/:documentId')
  .put(auth(), upload.single('image_pdf'), documentController.updateDocument)

router
  .route('/webDashboard')
  .post(auth(), documentController.webDashboard)


export default router;
