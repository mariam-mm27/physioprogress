const express = require("express");
const router = express.Router();
const { createSessionLog, getSessionLogs } = require("./controllers/SessionLogController");
const { protect } = require("./middlewares/authentication");
const restrictTo = require("./middlewares/restrictTo");

const authenticate = (req, res, next) => {
	Promise.resolve(protect(req, next)).catch(next);
};

router.post("/logs", authenticate, restrictTo("patient"), createSessionLog);
router.get(
	"/logs/patient/:patientId",
	authenticate,
	restrictTo("patient", "therapist"),
	getSessionLogs
);

module.exports = router;
