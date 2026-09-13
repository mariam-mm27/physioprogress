const mongoose = require("mongoose");
const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createSessionLog = catchAsync(async (req, res, next) => {
    const { planId, completed, painLevel, notes, loggedAt } = req.body;
    const patientId = req.user._id;

    if (!planId || painLevel === undefined) {
        return next(new AppError(400, "Please provide planId and painLevel."));
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
        return next(new AppError(400, "Invalid plan ID format."));
    }

    if (painLevel < 1 || painLevel > 10) {
        return next(new AppError(400, "Pain level must be between 1 and 10."));
    }

    const existingPlan = await ExercisePlan.findById(planId);
    if (!existingPlan) {
        return next(new AppError(404, "Exercise plan not found."));
    }

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

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return next(new AppError(400, "Invalid patient ID format."));
    }

    if (currentUser.role !== 'therapist' && currentUser._id.toString() !== patientId) {
        return next(new AppError(403, "You do not have permission to access these session logs."));
    }

    const sessionLogs = await SessionLogs.find({ patientId })
        .populate("planId", "title description")
        .sort({ loggedAt: -1 });

    res.status(200).json({
        status: "success",
        message: "Session logs retrieved successfully",
        results: sessionLogs.length,
        sessionLogs: sessionLogs
    });
});

const updateSessionLog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { painLevel, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, "Invalid session log ID."));
    }

    if (painLevel === undefined && notes === undefined) {
        return next(new AppError(400, "Provide painLevel or notes to update."));
    }

    if (painLevel !== undefined && (painLevel < 1 || painLevel > 10)) {
        return next(new AppError(400, "Pain level must be between 1 and 10."));
    }

    const sessionLog = await SessionLogs.findById(id);

    if (!sessionLog) {
        return next(new AppError(404, "Session log not found."));
    }

    if (sessionLog.patientId.toString() !== req.user._id.toString()) {
        return next(new AppError(403, "You can only edit your own session logs."));
    }

    const updates = {};
    if (painLevel !== undefined) updates.painLevel = painLevel;
    if (notes !== undefined) updates.notes = notes;

    const updatedSessionLog = await SessionLogs.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "success",
        message: "Session log updated successfully.",
        sessionLog: updatedSessionLog
    });
});

const deleteSessionLog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, "Invalid session log ID."));
    }

    const sessionLog = await SessionLogs.findById(id);

    if (!sessionLog) {
        return next(new AppError(404, "Session log not found."));
    }

    if (sessionLog.patientId.toString() !== req.user._id.toString()) {
        return next(new AppError(403, "You can only delete your own session logs."));
    }

    await SessionLogs.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Session log deleted successfully.",
        sessionLog
    });
});

module.exports = {
    createSessionLog,
    getSessionLogs,
    updateSessionLog,
    deleteSessionLog
};