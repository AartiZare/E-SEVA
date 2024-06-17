import multer from "multer";
import path from "path";
import fs from "fs";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.body.branch_name) {
      const branchName = req.body.branch_name;
      // const uploadPath = path.join(__dirname, 'uploads', branchName);
      const uploadPath = `public/uploads/${branchName}`;

      // Check if the directory exists
      if (!fs.existsSync(uploadPath)) {
        // Create the directory if it does not exist
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
            console.error("Error creating directory:", err);
            cb(err, uploadPath);
          }
        });
      }

      cb(null, uploadPath);
    } else {
      const uploadPath = `public/uploads/profileImages`;

      // Check if the directory exists
      if (!fs.existsSync(uploadPath)) {
        // Create the directory if it does not exist
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
            console.error("Error creating directory:", err);
            cb(err, uploadPath);
          }
        });
      }

      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    if (req.body.document_reg_no) {
      const newFilename = `${req.body.document_reg_no}${path.extname(
        file.originalname
      )}`;
      cb(null, newFilename);
    } else {
      const newFilename = `${req.body.contact_number}${path.extname(
        file.originalname
      )}`;
      cb(null, newFilename);
    }
  },
});
// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 200 },
});

export default upload;
