const express = require("express");
const { createExercisePlan, getExercisePlans } = require("../controllers/ExercisePlanController");
const {UpdateExercisePlan,DeleteExercisePlan} = require("../controllers/ExercisePlanUpdate&Delete");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

router.post("/:patientId", protect, restrictTo("therapist"), createExercisePlan);
router.get("/:patientId", protect, getExercisePlans);
router.put("/:id",protect,restrictTo("therapist"),UpdateExercisePlan);
router.delete("/:id",protect,restrictTo("therapist"),DeleteExercisePlan);

module.exports = router;
