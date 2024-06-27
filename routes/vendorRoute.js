import express from "express";
import { validate } from "../middlewares/validate.js";
import { vendorValidation } from "../validations/index.js";
import { vendorController } from "../controllers/index.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/")
  // Create a new vendor
  .post(
    upload.single("profile_image"),
    validate(vendorValidation.createVendor),
    vendorController.createVendor
  )
  // Get all vendors
  .get(vendorController.getAllVendors);

router
  .route("/soft-delete/:id")
/**
 * Soft delete
 */
  .put(vendorController.softDeleteVendor);


export default router;
