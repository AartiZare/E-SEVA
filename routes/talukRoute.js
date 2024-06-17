import express from "express";
import * as talukController from "../controllers/talukController.js";

const router = express.Router();

router
  .route("/")
  // Create a new taluk
  .post(talukController.createTaluk)
  // Get all taluks
  .get(talukController.getTaluks);

router
  .route("/:id")
  // Get a taluk by ID
  .get(talukController.getTalukById)
  // Update a taluk by ID
  .put(talukController.updateTaluk)
  // Delete a taluk by ID
  .delete(talukController.deleteTaluk);

router
  .route("/taluk/:districtId")
  // Get a taluk by district ID
  .get(talukController.getTalukByDisctrictId);
export default router;
