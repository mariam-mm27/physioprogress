const { protect } = require("../middlewares/authentication");
const { isPatient } = require("../middlewares/restrictTo");
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const  {GetPatients } = require("../controllers/ExercisePlanUpdate&Delete");
const  {protect}  = require("../middlewares/authentication");

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/deleted', userController.getDeletedUsers);
router.get('/patients', protect, GetPatients);

router.get(
  '/unassigned-patients',
  protect,
  restrictTo('therapist'),
  userController.getUnassignedPatients
);

router.put(
  '/assign-therapist/:patientId',
  protect,
  restrictTo('therapist'),
  validateObjectIdParam('patientId'),
  runValidation,
  userController.assignTherapist
);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.softDeleteUser);

module.exports = router;
