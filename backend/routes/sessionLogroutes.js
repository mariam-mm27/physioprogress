const express = require("express");
const router = express.Router();
const { createSessionLog, getSessionLogs } = require("../controllers/SessionLogController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

router.post("/logs", protect, restrictTo("patient"), createSessionLog);
router.get(
	"/logs/patient/:patientId",
	protect,
	restrictTo("patient", "therapist"),
	getSessionLogs
);

module.exports = router;
