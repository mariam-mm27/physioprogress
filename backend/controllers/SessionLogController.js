const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createSessionLog = catchAsync(async (req, res, next) => {
    const { planId, completed, painLevel, notes, loggedAt } = req.body;
    const patientId = req.user._id;

    // 1. Input Validation
    if (!planId || painLevel === undefined) {
        return next(new AppError("Please provide planId and painLevel.", 400));
    }

    if (painLevel < 1 || painLevel > 10) {
        return next(new AppError("Pain level must be between 1 and 10.", 400));
    }

    // 2. Verify exercise plan existence
    const existingPlan = await ExercisePlan.findById(planId);
    if (!existingPlan) {
        return next(new AppError("Exercise plan not found.", 404));
    }

    // 3. Create session log
    const newSessionLog = await SessionLogs.create({
        patientId,
        planId,
        completed,
        painLevel,
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

    // Authorization check: User must be either the patient or a therapist
    if (currentUser.role !== 'therapist' && currentUser._id.toString() !== patientId) {
        return next(new AppError("You do not have permission to access these session logs.", 403));
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
