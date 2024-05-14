import multer from "multer";

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// Create the multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export default upload;
