const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiFeatures = require("../utils/ApiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let features = new ApiFeatures(User.find({ isDeleted: false }), req.query)
    .filter()
    .fields()
    .sort()
    .search()
    .pagination();

  const users = await features.query;
  const usersCount = await User.countDocuments({
    isDeleted: false,
    ...features.filterQuery,
    ...features.searchQuery
  });

  res.status(200).json({
    success: true,
    usersCount,
    results: users.length,
    data: users
  });
});

exports.getDeletedUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: true }).select("+isDeleted +deletedAt");
  res.status(200).json({
    success: true,
    userCount: users.length,
    data: users
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ isDeleted: false, _id: req.params.id }).populate('assignedTherapist', 'fullName email');
  if (!user) return next(new AppError(404, `No User found with this id ${req.params.id}`));

  res.status(200).json({
    success: true,
    data: user
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, +process.env.SALT_ROUNDS);
  }

  const user = await User.create(req.body);
  user.password = undefined;

  res.status(201).json({
    success: true,
    data: user
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password) delete req.body.password;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { ...req.body },
    { returnDocument: "after", runValidators: true }
  );

  if (!user) return next(new AppError(404, `No user found with this id ${req.params.id}`));

  res.status(200).json({
    success: true,
    data: user
  });
});

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );

  if (!user) return next(new AppError(404, `No user found with this id ${req.params.id}`));

  res.status(200).json({
    success: true,
    message: "User is deleted successfully"
  });
});

exports.DeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError(404, `No user found with this id ${req.params.id}`));

  res.status(204).send();
});