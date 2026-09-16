const ExercisePlans = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const { ReturnDocument } = require("mongodb");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const createExercisePlan = catchAsync(async (req, res, next) => {
    const{
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

    const newExercisePlan = await ExercisePlans.create({
        therapistId,
        patientId,
        title,
        exerciseName,
        targetMuscle,
        customMuscle,
        reps,
        frequencyPerWeek,
        videoUrl,
        videoSource
    });
    res.status(201).json({
        success: true,
        data: newExercisePlan
    });
});

const getExercisePlans = catchAsync(async (req, res, next) => {
    const therapistId = req.user._id;
    const patientId = req.params.patientId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";

    const filter = {
        patientId: patientId,
        therapistId: therapistId
    };

    if (req.query.muscle) {
        filter.targetMuscle = req.query.muscle;
    }

    const exercisePlans = await ExercisePlans.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const totalPlans = await ExercisePlans.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: exercisePlans,
        pagination: {
        currentPage: page,
        limit: limit,
        totalPlans: totalPlans,
        totalPages: Math.ceil(totalPlans / limit)
    }
    });
});


const UpdateExercisePlan= catchAsync(async (req,res,next)=> {
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
            reps,
            frequencyPerWeek,
            videoUrl
        } = req.body;

        const exercisePlan = await ExercisePlans.findOneAndUpdate({_id:req.params.id, therapistId: req.user._id},
                                                                    {title,exerciseName,reps,frequencyPerWeek,videoUrl,updatedAt: new Date()},
                                                                    {returnDocument:"after",runValidators:true})
        if (!exercisePlan) {
        return next(
            new AppError(
                404,
                `No Exercise Plan found with this id ${req.params.id}`)
            )
        }
        res.status(200).json({
            success:true,
            data : exercisePlan
        })

})


const DeleteExercisePlan= catchAsync(async (req,res,next)=> {
        const exercisePlan = await ExercisePlans.findOneAndDelete({_id: req.params.id,therapistId: req.user._id})
      if (!exercisePlan) {
        return next(
            new AppError(
                404,
                `No Exercise Plan found with this id ${req.params.id}`
            )
        );
    }
        res.status(200).json({
            success:true,
            message : "Exercise Plan is Deleted Successfully"
        })

})


const GetPatients = catchAsync(async (req, res, next) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";

    const patients = await User.find({
        role: "patient",
        assignedTherapist: req.user._id,
        isDeleted: false
    })
    .select("fullName email")
    .sort(sort)
    .skip(skip)
    .limit(limit);

    const totalPatients = await User.countDocuments({
        role: "patient",
        assignedTherapist: req.user._id,
        isDeleted: false
    });

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
}
