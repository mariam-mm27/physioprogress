const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
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
        type: String,
        trim: true,
        maxlength: 1000
    },
    loggedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

sessionLogSchema.index({ patientId: 1 });
sessionLogSchema.index({ planId: 1 });
sessionLogSchema.index({ patientId: 1, loggedAt: -1 });

module.exports = mongoose.model('SessionLog', sessionLogSchema);
