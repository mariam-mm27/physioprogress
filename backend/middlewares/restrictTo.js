const AppError = require("../utils/AppError");

const restrictTo = (...roles) => (req, res, next) => {
    const { role } = req.user;

    if (roles.includes(role)) {
    return next();
    }

    return next(new AppError(403, "You are not allowed to access this route"));
};

const isTherapist = (req, res, next) => {
    if (req.user.role === "therapist") {
        return next();
    }
    return next(new AppError(403, "Therapist access only"));
};

const isPatient = (req, res, next) => {
    if (req.user.role === "patient") {
        return next();
    }
    return next(new AppError(403, "Patient access only"));
};

module.exports = restrictTo;
module.exports.restrictTo = restrictTo;
module.exports.isTherapist = isTherapist;
module.exports.isPatient = isPatient;