const { createExercisePlan , getExercisePlans} = require("../controllers/ExercisePlanController");
const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);

module.exports = router;


const { createExercisePlan, getExercisePlans } =
    require("../controllers/ExercisePlanController");

const {
    updateSessionLog,
    deleteSessionLog
} = require("../controllers/SessionLogController");

const express = require("express");
const router = express.Router();

router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);

router.put("/logs/:id", updateSessionLog);
router.delete("/logs/:id", deleteSessionLog);

module.exports = router;
