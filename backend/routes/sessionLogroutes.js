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


router.post("/", protect, createSessionLog);


router.get("/patient/:patientId", protect, getSessionLogs);


router.put("/:id", protect, updateSessionLog);


router.delete("/:id", protect, deleteSessionLog);

module.exports = router;
