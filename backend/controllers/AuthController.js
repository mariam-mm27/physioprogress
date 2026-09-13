const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/sendEmail");
const template = require("../utils/emailTemplate");

const jwtSign = promisify(jwt.sign);

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, fullName, role } = req.body;

  // Check if email already exists
  const findUser = await User.findOne({ email, isDeleted: false });
  if (findUser) return next(new AppError(400, "This email is already used"));

  // Hash password
  const hashPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  // Generate OTP
  const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  const confirmOTP = await bcrypt.hash(otp, +process.env.SALT_ROUNDS);
  const OTPExpired = Date.now() + 10 * 60 * 1000;

  // Save user in database
  const user = await User.create({
    email,
    fullName,
    role,
    password: hashPassword,
    confirmOTP,
    OTPExpired
  });

  // Send OTP to email
  sendEmail(email, "Confirm Email", template(otp, fullName, "Confirm Email"));

  // Hide sensitive response data
  user.isDeleted = undefined;
  user.confirmOTP = undefined;
  user.OTPExpired = undefined;
  user.password = undefined;

  res.status(201).json({
    success: true,
    data: user
  });
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
  const { email, confirmOTP } = req.body;

  const findUser = await User.findOne({ isDeleted: false, email });
  if (!findUser) return next(new AppError(400, "This email doesn't exist please signup first!"));

  if (findUser.isConfirmed) return next(new AppError(400, "This email is already active"));

  const check = await bcrypt.compare(confirmOTP, findUser.confirmOTP || "");
  if (!check || !confirmOTP || findUser.OTPExpired < Date.now()) {
    return next(new AppError(400, "Invalid OTP or Expired"));
  }

  findUser.isConfirmed = true;
  findUser.confirmOTP = undefined;
  findUser.OTPExpired = undefined;
  await findUser.save();

  res.status(200).json({
    success: true,
    message: "Email is confirmed please login"
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const findUser = await User.findOne({ isDeleted: false, email });
  if (!findUser) return next(new AppError(400, "Invalid Credentials"));

  if (!findUser.isConfirmed) return next(new AppError(400, "This email isn't confirmed, please confirm first!"));

  const check = await bcrypt.compare(password, findUser.password);
  if (!check) return next(new AppError(400, "Invalid Credentials"));

  const token = await jwtSign(
    { _id: findUser._id, role: findUser.role },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    data: {
      accessToken: token
    }
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const findUser = await User.findOne({ isDeleted: false, email });
  if (!findUser) return next(new AppError(404, "This email is not found"));

  const resetToken = crypto.randomBytes(32).toString("hex");
  findUser.resetToken = resetToken;
  await findUser.save();

  const link = `http://localhost:8000/api/auth/reset-password/${resetToken}`;
  sendEmail(email, "Reset Password", template(link, findUser.fullName, "Reset Password"));

  res.status(200).json({
    success: true,
    message: "Reset link sent to email"
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const findUser = await User.findOne({ isDeleted: false, resetToken: token });
  if (!findUser) return next(new AppError(400, "The reset Token is invalid or expired"));

  if (password.length < 6) return next(new AppError(400, "Password must be 6 characters or more"));

  const hashPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);
  findUser.password = hashPassword;
  findUser.resetToken = undefined;
  await findUser.save();

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully"
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});
