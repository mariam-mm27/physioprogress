const express = require("express");
const router = express.Router();
const { createSessionLog, getSessionLogs, updateSessionLog, deleteSessionLog } = require("../controllers/SessionLogController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

router.post("/logs", protect, restrictTo("patient"), createSessionLog);
router.get(
	"/logs/patient/:patientId",
	protect,
	restrictTo("patient", "therapist"),
	getSessionLogs
);
router.put("/logs/:id", protect, restrictTo("patient"), updateSessionLog);
router.delete("/logs/:id", protect, restrictTo("patient"), deleteSessionLog);

module.exports = router;
