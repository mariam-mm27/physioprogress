const { createExercisePlan , getExercisePlans} = require("../controllers/ExercisePlanController");
const { UpdateExercisePlan, DeleteExercisePlan} = require("../controllers/ExercisePlanUpdate&Delete");
const express = require("express");
const { protect } = require("../middlewares/authentication");
const router = express.Router();


router.post("/plans/:patientId", createExercisePlan);
router.get("/plans/:patientId", getExercisePlans);
router.put("/plans/:id",UpdateExercisePlan);
router.delete("/plans/:id",DeleteExercisePlan);

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
