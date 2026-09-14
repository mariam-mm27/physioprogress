const express = require("express");
const router = express.Router();
const {
    getWeeklyAnalytics,
    getMonthlyAnalytics
} = require("../controllers/AnalyticsController");

const { protect } = require("../middlewares/authentication");

const restrictTo = require("../middlewares/restrictTo");

router.get(
    "/analytics/patient/:patientId/weekly",
    protect,
    restrictTo("patient", "therapist"),
    getWeeklyAnalytics
);

router.get(
    "/analytics/patient/:patientId/monthly",
    protect,
    restrictTo("patient", "therapist"),
    getMonthlyAnalytics
);

module.exports = router;