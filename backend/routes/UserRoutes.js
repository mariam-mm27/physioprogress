const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const  {GetPatients } = require("../controllers/ExercisePlanController");
const  {protect}  = require("../middlewares/authentication");

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/deleted', userController.getDeletedUsers);
router.get('/patients', protect, GetPatients);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.softDeleteUser);

module.exports = router;