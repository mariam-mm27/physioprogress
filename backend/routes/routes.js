const { createExercisePlan , getExercisePlans} = require("../controllers/ExercisePlanController");
const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);

module.exports = router;