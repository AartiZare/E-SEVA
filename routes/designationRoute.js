import express from "express";
import * as designationController from "../controllers/designationController.js";

const router = express.Router();

router
  .route("/")
  // Create a new designation
  .post(designationController.createDesignation)
  // Get all designations
  .get(designationController.getDesignations);

router
  .route("/:id")
  // Get a designation by ID
  .get(designationController.getDesignationById)
  // Update a designation by ID
  .put(designationController.updateDesignation)
  // Delete a designation by ID
  .delete(designationController.deleteDesignation);

export default router;
