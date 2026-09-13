const express = require("express");
const authController = require("../controllers/AuthController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

router.post("/register", authController.signup);
router.post("/confirm-email", authController.confirmEmail);
router.post("/login", authController.login);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/me", protect, authController.getMe);

module.exports = router;
