const express = require("express");

const {
    getWeeklyAnalytics,
    getMonthlyAnalytics
} = require("../controllers/AnalyticsController");

const { protect } = require("../middlewares/authentication");

const router = express.Router();

router.get(
    "/patient/:patientId/weekly",
    protect,
    getWeeklyAnalytics
);

router.get(
    "/patient/:patientId/monthly",
    protect,
    getMonthlyAnalytics
);

module.exports = router;