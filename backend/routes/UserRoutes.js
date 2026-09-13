const { protect } = require("../middlewares/authentication");
const { isPatient } = require("../middlewares/restrictTo");
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const  {GetPatients } = require("../controllers/ExercisePlanController");
const restrictTo = require("../middlewares/restrictTo");
const upload = require("../middlewares/multer");

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/deleted', userController.getDeletedUsers);
router.get('/patients', protect,restrictTo("therapist"),GetPatients);

router.put(
  '/assign-therapist',
  protect,
  isPatient,
  userController.assignTherapist
);

router.put('/profile', protect, userController.updateMe);

router.post(
  "/upload",
  protect,
  upload.single("profilePicture"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        filePath: req.file.path,
        fileName: req.file.filename
      });
    } catch (error) {
      next(error);
    }
  }
);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.softDeleteUser);
module.exports = router;