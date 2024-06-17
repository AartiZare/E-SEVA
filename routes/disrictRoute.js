import express from "express";
import * as districtController from "../controllers/districtController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(districtController.createDistrict) // Create a new district
  .get(districtController.getDistricts); // Get all districts

router
  .route("/:id")
  .get(districtController.getDistrictById) // Get a district by ID
  .put(districtController.updateDistrict) // Update a district by ID
  .delete(districtController.deleteDistrict); // Delete a district by ID

router
  .route("/division/:divisionId")
  .get(districtController.getDistrictByDivisionId);

export default router;
