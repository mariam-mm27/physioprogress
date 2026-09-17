const ExercisePlans = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { uploadBufferToCloudinary } = require("../middlewares/cloudinary");

const createExercisePlan = catchAsync(async (req, res, next) => {
    const {
        title,
        exerciseName,
        targetMuscle,
        customMuscle,
        reps,
        frequencyPerWeek,
        videoUrl,
        videoSource
    } = req.body;

    const therapistId = req.user._id;
    const patientId = req.params.patientId;

    let finalVideoUrl = videoUrl;

    if (req.file) {
        const uploadResult = await uploadBufferToCloudinary(
            req.file.buffer,
            "physioprogress/exercises"
        );

        finalVideoUrl = uploadResult.url;
    }

    if (!finalVideoUrl) {
        return next(
            new AppError(400, "Video file or videoUrl is required")
        );
    }

    const newExercisePlan = await ExercisePlans.create({
        therapistId,
        patientId,
        title,
        exerciseName,
        targetMuscle,
        customMuscle,
        reps,
        frequencyPerWeek,
        videoUrl: finalVideoUrl,
        videoSource: req.file
            ? "custom"
            : (videoSource || "external")
    });

    res.status(201).json({
        success: true,
        message: "Exercise Plan Created Successfully",
        data: newExercisePlan
    });
});


const getExercisePlans = catchAsync(async (req, res) => {
    const patientId = req.params.patientId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";

    const filter = {
        patientId: patientId
    };

    if (req.user.role === "therapist") {
        filter.therapistId = req.user._id;
    }

    if (req.query.muscle) {
        filter.targetMuscle = req.query.muscle;
    }

    const [exercisePlans, totalPlans] = await Promise.all([
        ExercisePlans.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        ExercisePlans.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        message: "Exercise Plans Retrieved Successfully",
        data: exercisePlans,
        exercisePlans: exercisePlans,
        pagination: {
            currentPage: page,
            limit: limit,
            totalPlans: totalPlans,
            totalPages: Math.ceil(totalPlans / limit)
        }
    });
});


const UpdateExercisePlan = catchAsync(async (req, res, next) => {
    if (
        Object.prototype.hasOwnProperty.call(req.body, "patientId") ||
        Object.prototype.hasOwnProperty.call(req.body, "therapistId")
    ) {
        return next(
            new AppError(
                400,
                "patientId and therapistId cannot be modified"
            )
        );
    }

    const {
        title,
        exerciseName,
        targetMuscle,
        customMuscle,
        reps,
        frequencyPerWeek,
        videoUrl,
        videoSource
    } = req.body;

    const exercisePlan = await ExercisePlans.findOneAndUpdate(
        {
            _id: req.params.id,
            therapistId: req.user._id
        },
        {
            title,
            exerciseName,
            targetMuscle,
            customMuscle,
            reps,
            frequencyPerWeek,
            videoUrl,
            videoSource,
            updatedAt: new Date()
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!exercisePlan) {
        return next(
            new AppError(
                404,
                `No Exercise Plan found with this id ${req.params.id}`
            )
        );
    }

    res.status(200).json({
        success: true,
        data: exercisePlan
    });
});


const DeleteExercisePlan = catchAsync(async (req, res, next) => {
    const exercisePlan = await ExercisePlans.findOneAndDelete({
        _id: req.params.id,
        therapistId: req.user._id
    });

    if (!exercisePlan) {
        return next(
            new AppError(
                404,
                `No Exercise Plan found with this id ${req.params.id}`
            )
        );
    }

    res.status(200).json({
        success: true,
        message: "Exercise Plan is Deleted Successfully"
    });
});


const GetPatients = catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";

    const filter = {
        role: "patient",
        assignedTherapist: req.user._id,
        isDeleted: false
    };

    const [patients, totalPatients] = await Promise.all([
        User.find(filter)
            .select("fullName email")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: patients,
        pagination: {
            currentPage: page,
            limit: limit,
            totalPatients: totalPatients,
            totalPages: Math.ceil(totalPatients / limit)
        }
    });
});


module.exports = {
    createExercisePlan,
    getExercisePlans,
    UpdateExercisePlan,
    DeleteExercisePlan,
    GetPatients
};