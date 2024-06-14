import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router
.route('/')
.post(auth(), feedbackController.create)
.get(auth(), feedbackController.getFeedbackList);

export default router;
