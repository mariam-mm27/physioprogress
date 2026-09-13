const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");


const getAnalytics = (days) => catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const currentUser = req.user;

    // Patient can only see their own analytics
    if (
        currentUser.role !== "therapist" &&
        currentUser._id.toString() !== patientId
    ) {
        return next(
            new AppError(
                403,
                "You do not have permission to access these analytics."
            )
        );
    }

    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(startDate.getDate() - days);

    // Get patient's exercise plans
    const exercisePlans = await ExercisePlan.find({
        patientId: patientId
    });

    // Calculate prescribed sessions
    const weeklyPrescribedSessions = exercisePlans.reduce(
        (total, plan) => total + plan.frequencyPerWeek,
        0
    );

    const prescribedSessions =
        weeklyPrescribedSessions * (days / 7);

    // Get completed sessions during the period
    const completedSessions = await SessionLogs.countDocuments({
        patientId: patientId,
        completed: true,
        loggedAt: {
            $gte: startDate,
            $lte: endDate
        }
    });

    let adherenceRate = 0;

    if (prescribedSessions > 0) {
        adherenceRate =
            (completedSessions / prescribedSessions) * 100;
    }

    // Get logs for average pain level
    const painData = await SessionLogs.aggregate([
        {
            $match: {
                patientId: currentUser._id,
                loggedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                averagePainLevel: {
                    $avg: "$painLevel"
                }
            }
        }
    ]);

    const averagePainLevel =
        painData.length > 0
            ? Number(painData[0].averagePainLevel.toFixed(2))
            : 0;

    res.status(200).json({
        status: "success",
        period: `${days} days`,
        analytics: {
            completedSessions,
            prescribedSessions: Number(prescribedSessions.toFixed(2)),
            adherenceRate: Number(adherenceRate.toFixed(2)),
            averagePainLevel
        }
    });
});


const getWeeklyAnalytics = getAnalytics(7);

const getMonthlyAnalytics = getAnalytics(30);


module.exports = {
    getWeeklyAnalytics,
    getMonthlyAnalytics
};