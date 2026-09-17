const mongoose = require('mongoose');

const exercisePlanSchema = new mongoose.Schema({

    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true
    },

    exerciseName: {
        type: String,
        required: true
    },

    reps: {
        type: Number,
        required: true
    },

    frequencyPerWeek: {
        type: Number,
        required: true
    },

    videoUrl: {
        type: String,
        required: true
    },

    targetMuscle: {
        type: String,
        required: true
    },

    customMuscle: {
        type: String
    },

    videoSource: {
        type: String,
        enum: ['custom', 'api', 'external'],
        required: true
    }

}, {
    timestamps: true
});

// Index for faster patient plans queries
exercisePlanSchema.index({
    patientId: 1,
    createdAt: -1
});

module.exports = mongoose.model('ExercisePlan', exercisePlanSchema);