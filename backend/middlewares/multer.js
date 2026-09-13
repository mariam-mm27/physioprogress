const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    // Secure filename: timestamp + random + ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, "Please upload only image files (JPEG, PNG, GIF, WebP)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  }
});

module.exports = upload;