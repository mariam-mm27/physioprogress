const SessionLogs = require("../models/SessionLog");

const createSessionLog = async (req, res) => {
    try {
        const { planId, completed, painLevel, notes, loggedAt } = req.body;
        const patientId = req.user.id;

        const newSessionLog = await SessionLogs.create({
            patientId,
            planId,
            completed,
            painLevel,
            notes,
            loggedAt
        });

        res.status(201).json({
            message: "Session Log Created Successfully",
            sessionLog: newSessionLog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const getSessionLogs = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        const sessionLogs = await SessionLogs.find({ patientId: patientId }).sort({ loggedAt: -1 });

        res.status(200).json({
            message: "Session Logs Retrieved Successfully",
            sessionLogs: sessionLogs
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createSessionLog,
    getSessionLogs
}
