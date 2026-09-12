const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExercisePlan',
        required: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    painLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    notes: {
        type: String
    },
    loggedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model('SessionLog', sessionLogSchema);
