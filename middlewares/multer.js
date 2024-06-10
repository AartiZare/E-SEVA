import multer from "multer";
import path from "path";
import fs from "fs";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const branchName = req.body.branch_name;
    // const uploadPath = path.join(__dirname, 'uploads', branchName);
    const uploadPath = `public/uploads/${branchName}`;

    // Check if the directory exists
    if (!fs.existsSync(uploadPath)) {
        // Create the directory if it does not exist
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
              console.error('Error creating directory:', err);
              cb(err, uploadPath);
          }
      });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const newFilename = `${req.body.document_reg_no}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  },
});
// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export default upload;
