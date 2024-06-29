import express from 'express';
import db from '../models/index.js';
const documentModel = db.Document;
const rejectionReasonModel = db.DocumentRejectReason;
import { catchAsync } from "../utils/catchAsync.js";
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import auth from "../middlewares/auth.js";

const router = express.Router();

router.route('/rejection-reasons')
  .post(
    auth(),
    catchAsync(async (req, res, next) => {
      const { issueTypes } = req.body;
      const userId = req.user.id;

      // Create the rejection reason
      const rejectionReason = await rejectionReasonModel.create({
        issue_types: issueTypes,
        created_by: userId,
      });

      return res.status(httpStatus.CREATED).send({
        status: true,
        data: rejectionReason,
        message: "Rejection reason created successfully",
      });
    })
  )
  .get(
    auth(),
    catchAsync(async (req, res, next) => {
      const rejectionReasons = await rejectionReasonModel.findAll({});
      return res.status(httpStatus.OK).send({
        status: true,
        data: rejectionReasons,
        message: "Rejection reasons retrieved successfully",
      });
    })
);

export default router;
