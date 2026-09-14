const mongoose = require("mongoose");
const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return {
        startDate,
        endDate
    };
};


const getSessionAnalytics = async (patientId, startDate, endDate) => {
    const sessionAnalytics = await SessionLogs.aggregate([
        {
            $match: {
                patientId: patientId,
                loggedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                completedSessions: {
                    $sum: {
                        $cond: [
                            { $eq: ["$completed", true] },
                            1,
                            0
                        ]
                    }
                },
                averagePainLevel: {
                    $avg: "$painLevel"
                },
                totalSessionLogs: {
                    $sum: 1
                }
            }
        }
    ]);
    return sessionAnalytics[0] || {
        completedSessions: 0,
        averagePainLevel: 0,
        totalSessionLogs: 0
    };
};


const getExpectedSessions = async (patientId, days) => {
    const plans = await ExercisePlan.find({
        patientId: patientId
    });
    let expectedSessions = 0;
    plans.forEach(plan => {
        expectedSessions += (plan.frequencyPerWeek * days) / 7;
    });
    return expectedSessions;
};



const getWeeklyAnalytics = catchAsync(async (req, res, next) => {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId);
    const { startDate, endDate } = getDateRange(7);

    const sessionAnalytics = await getSessionAnalytics(
        patientId,
        startDate,
        endDate
    );

    const expectedSessions = await getExpectedSessions(patientId, 7);

    const adherenceRate = expectedSessions > 0
        ? (sessionAnalytics.completedSessions / expectedSessions) * 100
        : 0;

    res.status(200).json({
        success: true,
        data: {
            period: "weekly",
            adherenceRate,
            averagePainLevel: sessionAnalytics.averagePainLevel,
            completedSessions: sessionAnalytics.completedSessions,
            expectedSessions,
            totalSessionLogs: sessionAnalytics.totalSessionLogs
        }
    });
});


const getMonthlyAnalytics = catchAsync(async (req, res, next) => {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId);
    const { startDate, endDate } = getDateRange(30);

    const sessionAnalytics = await getSessionAnalytics(
        patientId,
        startDate,
        endDate
    );

    const expectedSessions = await getExpectedSessions(patientId, 30);

    const adherenceRate = expectedSessions > 0
        ? (sessionAnalytics.completedSessions / expectedSessions) * 100
        : 0;

    res.status(200).json({
        success: true,
        data: {
            period: "monthly",
            adherenceRate,
            averagePainLevel: sessionAnalytics.averagePainLevel,
            completedSessions: sessionAnalytics.completedSessions,
            expectedSessions,
            totalSessionLogs: sessionAnalytics.totalSessionLogs
        }
    });
});

module.exports = {
    getWeeklyAnalytics,
    getMonthlyAnalytics
};