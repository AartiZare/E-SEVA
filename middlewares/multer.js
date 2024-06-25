import multer from "multer";
import path from "path";
import fs from "fs";
import logger from "../loggers.js";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info("Received request headers", req.headers);

    if (req.headers['x-branch-name']) {
      const branchName = req.headers['x-branch-name'];
      const documentRegNo = req.headers['x-document-reg-no'];
      const uploadPath = `public/uploads/${branchName}/${documentRegNo}`;

      logger.info(`Branch name: ${branchName}`);
      logger.info(`Document registration number: ${documentRegNo}`);
      logger.info(`Upload path: ${uploadPath}`);

      // Check if the directory exists
      if (!fs.existsSync(uploadPath)) {
        // Create the directory if it does not exist
        logger.info(`Directory does not exist, creating: ${uploadPath}`);
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
            logger.error("Error creating directory:", err);
            return cb(err, uploadPath);
          }
        });
      }

      logger.info("Directory verified/created successfully");
      cb(null, uploadPath);
    } else {
      const uploadPath = `public/uploads/profileImages`;
      logger.info(`Upload path for profile images: ${uploadPath}`);

      // Check if the directory exists
      if (!fs.existsSync(uploadPath)) {
        // Create the directory if it does not exist
        logger.info(`Directory does not exist, creating: ${uploadPath}`);
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
            logger.error("Error creating directory:", err);
            return cb(err, uploadPath);
          }
        });
      }

      logger.info("Directory verified/created successfully");
      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    logger.info("Generating filename from headers", req.headers);

    if (req.headers['x-document-reg-no']) {
      const newFilename = `${req.headers['x-file-page-number']}${path.extname(file.originalname)}`;
      logger.info(`Generated filename: ${newFilename}`);
      cb(null, newFilename);
    } else {
      const newFilename = `${req.headers.contact_number}${path.extname(file.originalname)}`;
      logger.info(`Generated filename: ${newFilename}`);
      cb(null, newFilename);
    }
  },
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 }, // 200 MB limit
});

export default upload;
