// const multer = require("multer");
// const AppError = require("../utils/AppError");

// const fileFilter = (req, file, cb) => {
//   const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new AppError(400, "Please upload only image files (JPEG, PNG, GIF, WebP)"), false);
//   }
// };

// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024
//   }
// });

// module.exports = upload;


const multer = require("multer");
const AppError = require("../utils/AppError");

const fileFilter = (req, file, cb) => {
  
  const allowedMimes = [
    
    "image/jpeg", 
    "image/png", 
    "image/gif", 
    "image/webp",
   
    "video/mp4", 
    "video/quicktime", 
    "video/x-msvideo",  
    "video/webm",
    "video/mkv"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only image or video files!", 400), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 
  }
});

module.exports = upload;