const AppError = require("../utils/AppError")

const restrictTo = (...roles) => (req,res,next) => {
    const {role} = req.user
    if (roles.includes(role)) {
        return next()
    } else {
        return next(new AppError(403,`This route is protected for admin`))
    }
}


module.exports = restrictTo