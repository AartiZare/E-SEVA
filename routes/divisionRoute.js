import express from "express";
import * as divisionController from "../controllers/divisionController.js";

const router = express.Router();

router
  .route("/")
  // Create a new division
  .post(divisionController.createDivision)
  // Get all divisions
  .get(divisionController.getDivision);

router
  .route("/:id")
  // Get a division by ID
  .get(divisionController.getDivisionById)
  // Update a division by ID
  .put(divisionController.updateDivision)
  // Delete a division by ID
  .delete(divisionController.deleteDivision);

router
  .route("/delete/:id")
   // Delete a district by ID
  .put(divisionController.deleteDivision);


router
  .route("/state/:stateId")
  // Get a division by state ID
  .get(divisionController.getDivisionByStateId);

export default router;
