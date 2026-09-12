const ExercisePlans = require("../models/ExercisePlan");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const { ReturnDocument } = require("mongodb");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const createExercisePlan = async (req, res) => {
    try{
        const{title, exerciseName, reps, frequencyPerWeek, videoUrl} = req.body;
        const therapistId = req.user.id; 
        const patientId = req.params.patientId;

        const newExercisePlan = await ExercisePlans.create({
            therapistId,
            patientId,
            title,
            exerciseName,
            reps,
            frequencyPerWeek,
            videoUrl
        });
        res.status(201).json({
            message: "Exercise Plan Created Successfully",
            exercisePlan: newExercisePlan
        });

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const getExercisePlans = async (req, res) => {
    try{
        const therapistId = req.user.id;
        const patientId = req.params.patientId;
        const exercisePlans = await ExercisePlans.find(
            {
                 patientId:patientId,
                  therapistId:therapistId 
            }
        );
        res.status(200).json({
            message: "Exercise Plans Retrieved Successfully",
            exercisePlans: exercisePlans
        });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}


const UpdateExercisePlan= catchAsync(async (req,res,next)=> {
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

    const patients = await User.find({
        role: "patient",
        assignedTherapist: req.user._id,
        isDeleted: false
    })
    .select("fullName email")
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
