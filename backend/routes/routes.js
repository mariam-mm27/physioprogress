const { createExercisePlan , getExercisePlans} = require("../controllers/ExercisePlanController");
const { UpdateExercisePlan, DeleteExercisePlan , GetPatients } = require("../controllers/ExercisePlanUpdate&Delete");
const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);
router.put("/plans/:id",UpdateExercisePlan);
router.delete("/plans/:id",DeleteExercisePlan),
router.get("/users/patients", GetPatients);

module.exports = router;