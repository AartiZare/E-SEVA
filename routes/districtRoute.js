import express from "express";
import * as districtController from "../controllers/districtController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  // Create a new district
  .post(districtController.createDistrict)
  // Get all districts
  .get(districtController.getDistricts);

router
  .route("/:id")
  // Get a district by ID
  .get(districtController.getDistrictById)
  // Update a district by ID
  .put(districtController.updateDistrict);

router
  .route("/delete/:id")
   // Delete a district by ID
  .put(districtController.deleteDistrict);

router
  .route("/division/:divisionId")
  // Get a district by division ID
  .get(districtController.getDistrictByDivisionId);

export default router;
