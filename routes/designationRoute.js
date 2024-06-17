import express from "express";
import * as designationController from "../controllers/designationController.js";

const router = express.Router();

router
  .route("/")
  .post(designationController.createDesignation) // Create a new designation
  .get(designationController.getDesignations); // Get all designations

router
  .route("/:id")
  .get(designationController.getDesignationById) // Get a designation by ID
  .put(designationController.updateDesignation) // Update a designation by ID
  .delete(designationController.deleteDesignation); // Delete a designation by ID

export default router;
