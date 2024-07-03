import express from 'express';
import db from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import auth from '../middlewares/auth.js';

const router = express.Router();
const documentModel = db.Document;
const downloadLogModel = db.DownloadedDocumentLog;
const roleModel = db.Role;

router.route('/')
  .post(
    auth(),
    catchAsync(async (req, res, next) => {
      const { document_id } = req.body;
      const downloaded_by = req.user.id; 
      const userRole = await roleModel.findByPk(req.user.role_id);

      const document = await documentModel.findByPk(document_id);
      if (!document) {
        return next(
          new ApiError(
            httpStatus.NOT_FOUND,
            `Document with id ${document_id} not found`
          )
        );
      }

      const existingLog = await downloadLogModel.findOne({
        where: { document_id, downloaded_by },
      });

      if (existingLog) {
        // Update the existing download count
        await downloadLogModel.update(
          { download_count: existingLog.download_count + 1 },
          { where: { id: existingLog.id } }
        );
      } else {
        // Create a new download log entry
        await downloadLogModel.create({
          downloaded_by,
          document_id,
          download_count: 1,
          downloaded_by_role: userRole.name,
        });
      }
      const downloadCount = await downloadLogModel.sum('download_count', {
        where: { downloaded_by },
      });

      return res.status(httpStatus.OK).send({
        msg: "Document downloaded successfully",
        data: {
          document_id,
          downloaded_by,
          downloadCount,
          downloaded_by_role: userRole.name,
        },
      });
    })
  );

export default router;
