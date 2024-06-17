import express from "express";
import * as activityController from "../controllers/activityController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  // User Activity List
  .get(auth(), activityController.userActivityList);

export default router;
