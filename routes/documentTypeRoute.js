import express from "express";
import * as documentTypeController from "../controllers/documentTypeController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  // Create a new document type
  .post(documentTypeController.createDocumentType)
  // Get all document types
  .get(documentTypeController.getDocumentTypes);

router
  .route("/:id")
  // Get a document type by ID
  .get(documentTypeController.getDocumentTypeById)
  // Update a document type by ID
  .put(documentTypeController.updateDocumentType)
  // Delete a document type by ID
  .delete(documentTypeController.deleteDocumentType);

export default router;
