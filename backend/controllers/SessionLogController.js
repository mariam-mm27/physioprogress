const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createSessionLog = catchAsync(async (req, res, next) => {
    const { planId, completed, painLevel, notes, loggedAt } = req.body;
    const patientId = req.user._id; // Correct reference to MongoDB _id

    if (!planId || painLevel === undefined) {
        return next(new AppError("Please provide planId and painLevel.", 400));
    }

    if (painLevel < 1 || painLevel > 10) {
        return next(new AppError("Pain level must be between 1 and 10.", 400));
    }
    const existingPlan = await ExercisePlan.findById(planId);
    if (!existingPlan) {
        return next(new AppError("Exercise plan not found.", 404));
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

const updateSessionLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { completed, painLevel, notes } = req.body;

        const updatedSessionLog = await SessionLogs.findByIdAndUpdate(
            id,
            { completed, painLevel, notes },
            { new: true, runValidators: true }
        );

        if (!updatedSessionLog) {
            return res.status(404).json({ message: "Session Log not found" });
        }

        res.status(200).json({
            message: "Session Log Updated Successfully",
            sessionLog: updatedSessionLog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const deleteSessionLog = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSessionLog = await SessionLogs.findByIdAndDelete(id);

        if (!deletedSessionLog) {
            return res.status(404).json({ message: "Session Log not found" });
        }

        res.status(200).json({
            message: "Session Log Deleted Successfully",
            sessionLog: deletedSessionLog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createSessionLog,
    getSessionLogs,
    updateSessionLog,
    deleteSessionLog
}

