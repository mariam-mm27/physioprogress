const { protect } = require("../middlewares/authentication");
const { isPatient } = require("../middlewares/restrictTo");
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { GetPatients } = require("../controllers/ExercisePlanController");
const restrictTo = require("../middlewares/restrictTo");
const upload = require("../middlewares/multer");

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/deleted', userController.getDeletedUsers);
router.get('/patients', protect, restrictTo("therapist"), GetPatients);

router.put(
  '/assign-therapist',
  protect,
  isPatient,
  userController.assignTherapist
);

router.put('/profile', protect, userController.updateMe);

router.post(
  "/upload-picture",
  protect,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.softDeleteUser);

router.put(
  '/assign-patient',
  protect,
  restrictTo("therapist"),
  userController.assignPatient
);

router.get(
  '/unassigned-patients',
  protect,
  restrictTo("therapist"),
  userController.getUnassignedPatients
);

module.exports = router;