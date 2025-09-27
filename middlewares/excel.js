// middleware/excel.js
import multer from "multer";
import path from "path";

// Setup multer to handle file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define the folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Set the file size limit to 10MB
}).single("file"); // Make sure the field name matches the one in form-data

export { upload };
