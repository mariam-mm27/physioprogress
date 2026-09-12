const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createSessionLog = catchAsync(async (req, res, next) => {
    const { planId, completed, painLevel, notes, loggedAt } = req.body;
    const patientId = req.user._id;
    const numericPainLevel = Number(painLevel);

    if (!planId || painLevel === undefined) {
        return next(new AppError(400, "Please provide planId and painLevel."));
    }

    if (!Number.isFinite(numericPainLevel) || numericPainLevel < 1 || numericPainLevel > 10) {
        return next(new AppError(400, "Pain level must be between 1 and 10."));
    }
    const existingPlan = await ExercisePlan.findById(planId);
    if (!existingPlan) {
        return next(new AppError(404, "Exercise plan not found."));
    }
    if (!existingPlan.patientId || existingPlan.patientId.toString() !== patientId.toString()) {
        return next(new AppError(403, "You can only log sessions for your own exercise plans."));
    }
    const newSessionLog = await SessionLogs.create({
        patientId,
        planId,
        completed,
        painLevel: numericPainLevel,
        notes,
        loggedAt: loggedAt || Date.now()
    });

    res.status(201).json({
        status: "success",
        message: "Session log created successfully",
        sessionLog: newSessionLog
    });
});

const getSessionLogs = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const currentUser = req.user;
    
    if (currentUser.role !== 'therapist' && currentUser._id.toString() !== patientId) {
        return next(new AppError(403, "You do not have permission to access these session logs."));
    }

    const sessionLogs = await SessionLogs.find({ patientId }).sort({ loggedAt: -1 });

    res.status(200).json({
        status: "success",
        message: "Session logs retrieved successfully",
        results: sessionLogs.length,
        sessionLogs: sessionLogs
    });
});

module.exports = {
    createSessionLog,
    getSessionLogs
};
