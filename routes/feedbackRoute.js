import express from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  // Create a new feedback
  .post(auth(), feedbackController.create)
  // Get all feedbacks
  .get(auth(), feedbackController.getFeedbackList);

export default router;
