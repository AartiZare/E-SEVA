import express from "express";
import { validate } from "../middlewares/validate.js";
import * as documentValidation from "../validations/documentValidations.js";
import * as documentController from "../controllers/documentController.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/file")
  // Get a document by document ID
  .get(documentController.getDocFileByDocId);

router
  .route("/completeDocList")
  // Get document list
  .get(auth(), documentController.getDocumentList);

router
  .route("/")
  // Create a new document
  .post(
    auth(),
    // validate(documentValidation.createDocument),
    documentController.createDocument
  )
  // Get all pending documents
  .get(auth(), documentController.pendingDocumentListUser);

router
  .route("/uploadDocumentFile")
  .post(
    auth(),
    upload.single("image_pdf"),
    validate(documentValidation.uploadDocumentFile),
    documentController.uploadDocumentFile
  );

router
  .route("/documentUploadStatus")
  .get(auth(), documentController.userDocumentList);

router
  .route("/rejectedList")
  // Get all rejected documents
  .get(auth(), documentController.rejectedDocumentListUser);

router
  .route("/documentListUser")
  // Get all documents by user
  .get(auth(), documentController.getDocumentListUser);

router
  .route("/:documentId")
  // Get a document by document ID
  .get(auth(), documentController.getDocumentById)
  // Update a document by document ID to approve
  .put(auth(), documentController.approveDocument);

router
  .route("/rejecteDoc/:documentId")
  // Update a document by document ID to reject
  .put(auth(), documentController.rejectDocument);

router
  .route("/updateDocument/:documentId")
  // Update a document by document ID
  .put(auth(), upload.single("image_pdf"), documentController.updateDocument);

router
  .route("/webDashboard")
  // Get data for web dashboard
  .post(auth(), documentController.webDashboard);

export default router;
