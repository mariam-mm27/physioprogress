const ExercisePlans = require("../models/ExercisePlan");
const mongoose = require("mongoose");
const { ReturnDocument } = require("mongodb");


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

const UpdateExercisePlan= async (req,res)=> {
    try{
        const exercisePlan = await ExercisePlans.findOneAndUpdate({_id:req.params.id},
                                                                {...req.body,updatedAt:new Date()},
                                                                {returnDocument:"after",runValidators:true})
        if(!exercisePlan) return res.status(404).json({
            success:false,
            message:`No Exercise Plan found with this id ${req.params.id}`
        })

        res.status(200).json({
            success:true,
            data : exercisePlan
        })

    }catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
}
}


const DeleteExercisePlan= async (req,res)=> {
    try{
        const exercisePlan = await ExercisePlans.findByIdAndDelete(req.params.id)
        if(!exercisePlan) return res.status(404).json({
            success:false,
            message:`No Exercise Plan found with this id ${req.params.id}`
        })

        res.status(200).json({
            success:true,
            message : "Product is Deleted Successfully"
        })


    }catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
}
}



const GetPatients = async (req, res) => {
    try {
        if (req.user.role !== "therapist") {
        return res.status(403).json({
        success: false,
        message: "Only therapists can access this endpoint"});}
        const therapistId = req.user._id;

        const allPlans = await ExercisePlans.find(
            { therapistId },
            "patientId"
        );

        const patients = allPlans.map(plan => plan.patientId.toString());

        const uniquePatients = [...new Set(patients)];

        res.status(200).json({
            success: true,
            data: uniquePatients
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    createExercisePlan,
    getExercisePlans,
    UpdateExercisePlan,
    DeleteExercisePlan,
    GetPatients
}
