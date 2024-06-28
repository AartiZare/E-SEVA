import express from "express";
import { validate } from "../middlewares/validate.js";
import { userValidation } from "../validations/index.js";
import { userController } from "../controllers/index.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/userListingWithDocuments")
  /**
   * user with document listing
   */
  .get(userController.userListingWithDocDetails);
router
  .route("/forgot_password")
  // forgot password
  .post(userController.forgotPassword);

router
  .route("/reset_password")
  // reset password
  .post(userController.resetPassword);

router
  .route("/set-password")
  // set password
  .post(userController.set_password);

router
  .route("/verify_OTP")
  // verify OTP
  .post(userController.verifyOTP);

router
  .route("/myTeamUserList")
  // get my team user list
  .get(auth(), userController.getMyTeamUserList);

router
  .route("/")
  // Create a new user
  .post(
    auth(),
    upload.single("profile_image"),
    validate(userValidation.createUser),
    userController.create
  )
  // Get all users
  .get(auth(), validate(userValidation.getAllUsers), userController.getAll);

router
  .route("/:id")
  // Get a user by ID
  .put(
    upload.single("profile_image"),
    validate(userValidation.updateUser),
    userController.update
  )
  // Update a user by ID
  .get(validate(userValidation.getOneUser), userController.getUserById);

router
  .route("/login")
  // Login
  .post(validate(userValidation.login), userController.login);

router
  .route("/activate/:userId")
  // Activate user
  .put(userController.activateUser);

router
  .route("/deactivate/:userId")
  // Deactivate user
  .put(userController.deactivateUser);

router
  .route("/soft-delete/:id")
/**
 * Soft delete
 */
  .put(userController.softDeleteUser);

export default router;
