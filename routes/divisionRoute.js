import express from "express";
import * as divisionController from "../controllers/divisionController.js";

const router = express.Router();

router
  .route("/")
  .post(divisionController.createDivision) // Create a new division
  .get(divisionController.getDivision); // Get all divisions

router
  .route("/:id")
  .get(divisionController.getDivisionById) // Get a division by ID
  .put(divisionController.updateDivision) // Update a division by ID
  .delete(divisionController.deleteDivision); // Delete a division by ID

router.route("/state/:stateId").get(divisionController.getDivisionByStateId);

export default router;
