const express = require("express");
const router = express.Router();
const {
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getTherapistDashboard
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

/**
 * Get therapist dashboard with all patient data
 */
router.get(
    "/therapist/dashboard",
    protect,
    restrictTo("therapist"),
    getTherapistDashboard
);

module.exports = router;