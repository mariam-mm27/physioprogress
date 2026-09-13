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

    if (painLevel < 1 || painLevel > 10) {
        return next(new AppError(400, "Pain level must be between 1 and 10."));
    }

    // Make sure the plan belongs directly to the logged-in patient
    const existingPlan = await ExercisePlan.findOne({
        _id: planId,
        patientId: patientId
    });

    if (!existingPlan) {
        return next(
            new AppError(403, "This exercise plan does not belong to you.")
        );
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
    const { startDate, endDate } = req.query;
    const currentUser = req.user;

    if (
        currentUser.role !== "therapist" &&
        currentUser._id.toString() !== patientId
    ) {
        return next(
            new AppError(
                403,
                "You do not have permission to access these session logs."
            )
        );
    }

    const filter = {
        patientId: patientId
    };

    // Optional date filtering
    if (startDate || endDate) {
        filter.loggedAt = {};

        if (startDate) {
            filter.loggedAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
        }

        if (endDate) {
            filter.loggedAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
        }
    }

    const sessionLogs = await SessionLogs
        .find(filter)
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
    const { completed, painLevel, notes } = req.body;

    const updatedSessionLog = await SessionLogs.findByIdAndUpdate(
        id,
        { completed, painLevel, notes },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedSessionLog) {
        return next(new AppError(404, "Session Log not found"));
    }

    res.status(200).json({
        status: "success",
        message: "Session Log Updated Successfully",
        sessionLog: updatedSessionLog
    });
});


const deleteSessionLog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedSessionLog = await SessionLogs.findByIdAndDelete(id);

    if (!deletedSessionLog) {
        return next(new AppError(404, "Session Log not found"));
    }

    res.status(200).json({
        status: "success",
        message: "Session Log Deleted Successfully",
        sessionLog: deletedSessionLog
    });
});


module.exports = {
    createSessionLog,
    getSessionLogs,
    updateSessionLog,
    deleteSessionLog
};