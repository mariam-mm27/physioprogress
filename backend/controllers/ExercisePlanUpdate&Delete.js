const ExercisePlans = require("../models/ExercisePlan");
const mongoose = require("mongoose");
const { ReturnDocument } = require("mongodb");


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
        const exercisePlan = await ExercisePlans.findOneAndDelete(req.params.id)
        
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
        
        // const therapistId = req.user.id;
        const therapistId = req.query.therapistId;

        const allPlans = await ExercisePlans.find({},"patientId therapistId");

        const patients = allPlans
            .filter(plan => plan.therapistId.toString() === therapistId)
            .map(plan => plan.patientId.toString());

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
};


module.exports={
    UpdateExercisePlan,
    DeleteExercisePlan,
    GetPatients
}