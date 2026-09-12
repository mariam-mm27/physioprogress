const { protect } = require("../middlewares/authentication");
const { isPatient } = require("../middlewares/restrictTo");
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/deleted', userController.getDeletedUsers);

router.put(
  '/assign-therapist',
  protect,
  isPatient,
  userController.assignTherapist
);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.softDeleteUser);

module.exports = router;