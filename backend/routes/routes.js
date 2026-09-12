const { createExercisePlan , getPatientPlans} = require("../controllers/ExercisePlanController");
const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getPatientPlans);

module.exports = router;