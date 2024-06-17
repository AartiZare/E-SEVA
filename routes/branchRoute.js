import express from "express";
import { validate } from "../middlewares/validate.js";
import * as branchValidation from "../validations/branchValidation.js";
import * as branchController from "../controllers/branchController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(branchValidation.createBranch),
    branchController.createBranch
  )
  .get(branchController.getAllBranches);

router.route("/assign-branch").post(branchController.assignBranchToUser); // assign branch to user with userId and branchId which is PK in their own table

router.route("/user/branches").get(auth(), branchController.listBranchesByUser);

export default router;
