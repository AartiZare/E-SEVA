import express from 'express';
import db from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import auth from '../middlewares/auth.js';

const router = express.Router();
const documentModel = db.Document;
const documentFeedbackModel = db.DocumentFeedback;
const userModel = db.User;

router.route('/')
  .post(
    auth(),
    catchAsync(async (req, res, next) => {
      const { body } = req;
      const document = await documentModel.findByPk(body.document_id);
      if (!document) {
        return next(
          new ApiError(
            httpStatus.NOT_FOUND,
            `Document with id ${document_id} not found`
          )
        );
      }

      const userDetails = await userModel.findByPk(document.created_by);
      if (!userDetails) {
        return next(
          new ApiError(
            httpStatus.NOT_FOUND,
            `User with id ${document.created_by} not found`
          )
        );
      }

      const supervisorDetails = await userModel.findByPk(userDetails.created_by);
      if (!supervisorDetails) {
        return next(
          new ApiError(
            httpStatus.NOT_FOUND,
            `Supervisor with id ${userDetails.created_by} not found`
          )
        );
      }

      const feedback = await documentFeedbackModel.create({
        ...body,
        vendor_id: userDetails.vendor_id,
        squad_id: supervisorDetails.created_by,
        supervisor_id: userDetails.created_by,
        uploader_id: document.created_by,
        status: true,
      });

      // write logic to notify the vendor, squad supervisor, and uploader

      return res.status(httpStatus.CREATED).send({
        status: true,
        data: feedback,
        message: "Document feedback created successfully",
      });
    })
  );

export default router;
