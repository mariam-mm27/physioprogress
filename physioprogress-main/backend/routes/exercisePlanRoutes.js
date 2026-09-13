const express = require("express");
const { createExercisePlan, getExercisePlans } = require("../controllers/ExercisePlanController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

router.post("/:patientId", protect, restrictTo("therapist"), createExercisePlan);
router.get("/:patientId", protect, getExercisePlans);

module.exports = router;
