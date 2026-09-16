const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { createExercisePlan, getExercisePlans } = require("../controllers/ExercisePlanController");
const {UpdateExercisePlan,DeleteExercisePlan} = require("../controllers/ExercisePlanController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

router.post("/:patientId", protect, restrictTo("therapist"),upload.single("video"), createExercisePlan);
router.get("/:patientId", protect, getExercisePlans);
router.put("/:id",protect,restrictTo("therapist"),UpdateExercisePlan);
router.delete("/:id",protect,restrictTo("therapist"),DeleteExercisePlan);

module.exports = router;
