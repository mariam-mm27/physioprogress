const { createExercisePlan, getExercisePlans } = require("../controllers/ExercisePlanController");
const { createSessionLog, getSessionLogs } = require("../controllers/SessionLogController");
const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);

router.post("/logs", createSessionLog);
router.get("/logs/patient/:patientId", getSessionLogs);

module.exports = router;
