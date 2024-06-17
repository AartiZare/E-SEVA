import express from "express";
import * as stateController from "../controllers/stateController.js";

const router = express.Router();

router
  .route("/")
  .post(stateController.createState) // Create a new state
  .get(stateController.getState); // Get all states

router
  .route("/:id")
  .get(stateController.getStateById) // Get a state by ID
  .put(stateController.updateState) // Update a state by ID
  .delete(stateController.deleteState); // Delete a state by ID

export default router;
