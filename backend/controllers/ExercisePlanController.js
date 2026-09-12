const ExercisePlans = require("../models/ExercisePlan");

const createExercisePlan = async (req, res) => {
    try{
        const{title, exerciseName, reps, frequencyPerWeek, videoUrl, targetMuscle, customMuscle, videoSource} = req.body;
        const therapistId = req.user.id; 
        const patientId = req.params.patientId;

        const newExercisePlan = await ExercisePlans.create({
            therapistId,
            patientId,
            title,
            exerciseName,
            reps,
            frequencyPerWeek,
            videoUrl,
            targetMuscle,
            customMuscle,
            videoSource
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

const getPatientPlans = async (req, res) => {
    try{
        const therapistId = req.user.id;
        const patientId = req.params.patientId;
        const filter ={
            therapistId: therapistId,
            patientId: patientId
        }
        if(req.query.muscle){
            filter.targetMuscle = req.query.muscle;
        }
        if(req.query.plan){
            filter.title = req.query.plan;
        }
        const exercisePlans = await ExercisePlans.find(filter);
        res.status(200).json({
            message: "Exercise Plans Retrieved Successfully",
            exercisePlans: exercisePlans
        });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createExercisePlan,
    getPatientPlans
}
