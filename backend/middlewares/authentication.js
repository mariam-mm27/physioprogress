const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findOne({
            isDeleted: false,
            _id: decode._id
        });

        req.user = user;

        next();
    } else {
        return next(
            new AppError(401, "You are unauthorized please login first !")
        );
    }
};

module.exports = { protect };