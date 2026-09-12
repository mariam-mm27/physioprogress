const { createExercisePlan , getExercisePlans} = require("../controllers/ExercisePlanController");
const { UpdateExercisePlan, DeleteExercisePlan} = require("../controllers/ExercisePlanController");
const express = require("express");
const { protect } = require("../middlewares/authentication");
const router = express.Router();


router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);
router.put("/plans/:id",UpdateExercisePlan);
router.delete("/plans/:id",DeleteExercisePlan);

module.exports = router;