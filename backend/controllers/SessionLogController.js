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
        success: true,
        message: "Session log created successfully",
        data: newSessionLog
    });
});

const getSessionLogs = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;
    const currentUser = req.user;
    
    if (currentUser.role !== 'therapist' && currentUser._id.toString() !== patientId) {
        return next(new AppError(403, "You do not have permission to access these session logs."));
    }
    const filter = { patientId };

    if (startDate){
        filter.loggedAt={
            $gte:new Date (`${startDate}T00:00:00.000Z`)
        };
    }
    if (endDate){
        filter.loggedAt= {
            ...filter.loggedAt,
            $lte:new Date (`${endDate}T23:59:59.999Z`)
        }
    }
    const sessionLogs = await SessionLogs.find(filter).sort({ loggedAt: -1 });

    res.status(200).json({
        success: true,
        message: "Session logs retrieved successfully",
        results: sessionLogs.length,
        data: sessionLogs
    });
});

const updateSessionLog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { painLevel, notes, completed } = req.body;
    const patientId = req.user._id;

    const sessionLog = await SessionLogs.findById(id);

    if (!sessionLog) {
        return next(new AppError(404, "Session log not found."));
    }

    if (sessionLog.patientId.toString() !== patientId.toString()) {
        return next(new AppError(403, "You can only update your own session logs."));
    }

    if (painLevel !== undefined) {
        const numericPainLevel = Number(painLevel);
        if (!Number.isFinite(numericPainLevel) || numericPainLevel < 1 || numericPainLevel > 10) {
            return next(new AppError(400, "Pain level must be between 1 and 10."));
        }
        sessionLog.painLevel = numericPainLevel;
    }

    if (notes !== undefined) {
        sessionLog.notes = notes;
    }

    if (completed !== undefined) {
        sessionLog.completed = completed;
    }

    await sessionLog.save();

    res.status(200).json({
        success: true,
        message: "Session log updated successfully",
        data: sessionLog
    });
});

const deleteSessionLog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const patientId = req.user._id;

    const sessionLog = await SessionLogs.findById(id);

    if (!sessionLog) {
        return next(new AppError(404, "Session log not found."));
    }

    if (sessionLog.patientId.toString() !== patientId.toString()) {
        return next(new AppError(403, "You can only delete your own session logs."));
    }

    await SessionLogs.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Session log deleted successfully"
    });
});

module.exports = {
    createSessionLog,
    getSessionLogs,
    updateSessionLog,
    deleteSessionLog
};
