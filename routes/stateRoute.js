import express from "express";
import * as stateController from "../controllers/stateController.js";

const router = express.Router();

router
  .route("/")
  // Create a new state
  .post(stateController.createState)
  // Get all states
  .get(stateController.getState);

router
  .route("/:id")
  // Get a state by ID
  .get(stateController.getStateById)
  // Update a state by ID
  .put(stateController.updateState)
  // Delete a state by ID
  .delete(stateController.deleteState);

export default router;
