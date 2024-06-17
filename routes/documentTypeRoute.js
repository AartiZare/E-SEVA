import express from "express";
import * as documentTypeController from "../controllers/documentTypeController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(documentTypeController.createDocumentType) // Create a new document type
  .get(documentTypeController.getDocumentTypes); // Get all document types

router
  .route("/:id")
  .get(documentTypeController.getDocumentTypeById) // Get a document type by ID
  .put(documentTypeController.updateDocumentType) // Update a document type by ID
  .delete(documentTypeController.deleteDocumentType); // Delete a document type by ID

export default router;
