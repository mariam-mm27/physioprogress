const express = require("express");
const { 
    createSessionLog, 
    getSessionLogs,
    updateSessionLog,
    deleteSessionLog 
} = require("../controllers/SessionLogController");
const { protect } = require("../middlewares/authentication");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();


router.post("/", protect, restrictTo("patient"), createSessionLog);

router.get("/patient/:patientId", protect, getSessionLogs);

router.put("/:id", protect, restrictTo("patient"), updateSessionLog);

router.delete("/:id", protect, restrictTo("patient"), deleteSessionLog);

module.exports = router;