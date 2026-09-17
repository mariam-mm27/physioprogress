const mongoose = require("mongoose");
const SessionLogs = require("../models/SessionLog");
const ExercisePlan = require("../models/ExercisePlan");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return {
        startDate,
        endDate
    };
};


const getSessionAnalytics = async (patientId, startDate, endDate) => {
    const sessionAnalytics = await SessionLogs.aggregate([
        {
            $match: {
                patientId: patientId,
                loggedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                completedSessions: {
                    $sum: {
                        $cond: [
                            { $eq: ["$completed", true] },
                            1,
                            0
                        ]
                    }
                },
                averagePainLevel: {
                    $avg: "$painLevel"
                },
                totalSessionLogs: {
                    $sum: 1
                }
            }
        }
    ]);
    return sessionAnalytics[0] || {
        completedSessions: 0,
        averagePainLevel: 0,
        totalSessionLogs: 0
    };
};


const getExpectedSessions = async (patientId, days) => {
    const plans = await ExercisePlan.find({
        patientId: patientId
    });
    let expectedSessions = 0;
    plans.forEach(plan => {
        expectedSessions += (plan.frequencyPerWeek * days) / 7;
    });
    return expectedSessions;
};



const getWeeklyAnalytics = catchAsync(async (req, res, next) => {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId);
    const { startDate, endDate } = getDateRange(7);

    const sessionAnalytics = await getSessionAnalytics(
        patientId,
        startDate,
        endDate
    );

    const expectedSessions = await getExpectedSessions(patientId, 7);

    const adherenceRate = expectedSessions > 0
        ? (sessionAnalytics.completedSessions / expectedSessions) * 100
        : 0;

    res.status(200).json({
        success: true,
        data: {
            period: "weekly",
            adherenceRate,
            averagePainLevel: sessionAnalytics.averagePainLevel,
            completedSessions: sessionAnalytics.completedSessions,
            expectedSessions,
            totalSessionLogs: sessionAnalytics.totalSessionLogs
        }
    });
});


const getMonthlyAnalytics = catchAsync(async (req, res, next) => {
    const patientId = new mongoose.Types.ObjectId(req.params.patientId);
    const { startDate, endDate } = getDateRange(30);

    const sessionAnalytics = await getSessionAnalytics(
        patientId,
        startDate,
        endDate
    );

    const expectedSessions = await getExpectedSessions(patientId, 30);

    const adherenceRate = expectedSessions > 0
        ? (sessionAnalytics.completedSessions / expectedSessions) * 100
        : 0;

    res.status(200).json({
        success: true,
        data: {
            period: "monthly",
            adherenceRate,
            averagePainLevel: sessionAnalytics.averagePainLevel,
            completedSessions: sessionAnalytics.completedSessions,
            expectedSessions,
            totalSessionLogs: sessionAnalytics.totalSessionLogs
        }
    });
});


const getTherapistDashboard = catchAsync(async (req, res, next) => {
    const therapistId = req.user._id;

    const patients = await User.find({
        assignedTherapist: therapistId,
        role: 'patient',
        isDeleted: false
    }).select('_id fullName email patientCode injuryType profilePicture');

    if (!patients || patients.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    enrolledPatients: 0,
                    activePlans: 0,
                    clinicalAdherence: 0,
                    telemetrySessions: 0
                },
                patients: [],
                averagePainLevel: 0,
                averageAdherence: 0
            }
        });
    }

    const { startDate, endDate } = getDateRange(30);

    const patientsWithAnalytics = await Promise.all(
        patients.map(async (patient) => {
            const sessionAnalytics = await getSessionAnalytics(patient._id, startDate, endDate);
            
            const plansCount = await ExercisePlan.countDocuments({
                patientId: patient._id,
                therapistId: therapistId
            });

            const expectedSessions = await getExpectedSessions(patient._id, 30);
            const adherenceRate = expectedSessions > 0
                ? (sessionAnalytics.completedSessions / expectedSessions) * 100
                : 0;

            return {
                _id: patient._id,
                fullName: patient.fullName,
                email: patient.email,
                patientCode: patient.patientCode,
                injuryType: patient.injuryType,
                profilePicture: patient.profilePicture,
                role: 'patient',
                painLevel: Math.round(sessionAnalytics.averagePainLevel || 0),
                programAdherence: Math.round(adherenceRate),
                totalSessions: sessionAnalytics.totalSessionLogs || 0,
                activePlans: plansCount
            };
        })
    );

    const stats = {
        enrolledPatients: patients.length,
        activePlans: patientsWithAnalytics.reduce((sum, p) => sum + p.activePlans, 0),
        clinicalAdherence: patientsWithAnalytics.length > 0
            ? Math.round(patientsWithAnalytics.reduce((sum, p) => sum + p.programAdherence, 0) / patientsWithAnalytics.length)
            : 0,
        telemetrySessions: patientsWithAnalytics.reduce((sum, p) => sum + p.totalSessions, 0)
    };

    const averagePainLevel = patientsWithAnalytics.length > 0
        ? (patientsWithAnalytics.reduce((sum, p) => sum + p.painLevel, 0) / patientsWithAnalytics.length).toFixed(1)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            stats,
            patients: patientsWithAnalytics,
            averagePainLevel: parseFloat(averagePainLevel),
            averageAdherence: stats.clinicalAdherence
        }
    });
});

module.exports = {
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getTherapistDashboard
};