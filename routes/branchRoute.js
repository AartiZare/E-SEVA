import express from "express";
import { validate } from "../middlewares/validate.js";
import * as branchValidation from "../validations/branchValidation.js";
import * as branchController from "../controllers/branchController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  // Create a new branch
  .post(
    auth(),
    validate(branchValidation.createBranch),
    branchController.createBranch
  )
  // Get all branches
  .get(branchController.getAllBranches);

router
  .route("/assign-branch")
  // assign branch to user
  .post(branchController.assignBranchToUser); // assign branch to user with userId and branchId which is PK in their own table

router
  .route("/user/branches")
  // Get all branches by user
  .get(auth(), branchController.listBranchesByUser);

router
  .route("/delete/:id")
  .put(branchController.deleteBranch)

export default router;
