const express = require("express");
const router = express.Router();
const { createSessionLog, getSessionLogs } = require("../controllers/SessionLogController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
router.post("/logs", protect, createSessionLog);
router.get("/logs/patient/:patientId", protect, restrictTo("patient", "therapist"), getSessionLogs);
module.exports = router;
