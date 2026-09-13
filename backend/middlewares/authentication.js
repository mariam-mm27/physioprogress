const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "You are unauthorized please login first !"));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    return next(new AppError(401, "Invalid or expired token, please login again !"));
  }

  const user = await User.findOne({ isDeleted: false, _id: decoded._id });
  if (!user) {
    return next(new AppError(401, "The user belonging to this token no longer exists"));
  }

  req.user = user;
  next();
});

module.exports = { protect };
