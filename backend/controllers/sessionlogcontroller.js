const SessionLog = require("../models/SessionLog");

const updateSessionLog = async (req, res) => {
    try {
        const log = await SessionLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!log) {
            return res.status(404).json({
                message: "Session log not found"
            });
        }

        res.status(200).json(log);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteSessionLog = async (req, res) => {
    try {
        const log = await SessionLog.findByIdAndDelete(
            req.params.id
        );

        if (!log) {
            return res.status(404).json({
                message: "Session log not found"
            });
        }

        res.status(200).json({
            message: "Session log deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    updateSessionLog,
    deleteSessionLog
};
