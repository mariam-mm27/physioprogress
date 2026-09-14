const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { customAlphabet } = require("nanoid");
const sendEmail = require("../utils/sendEmail");
const template = require("../utils/emailTemplate");

const jwtSign = promisify(jwt.sign);

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, fullName, role, injuryType, specialization, bio, therapistCode } = req.body;
  // Check if email already exists
  const findUser = await User.findOne({ email, isDeleted: false });
  if (findUser) return next(new AppError(400, "This email is already used"));

  // Hash password
  const hashPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  // Generate OTP
  const otp = customAlphabet("0123456789", 6)();
  const confirmOTP = await bcrypt.hash(otp, +process.env.SALT_ROUNDS);
  const OTPExpired = Date.now() + 10 * 60 * 1000;

  let assignedTherapist = null;
  let code;
  if (role === 'therapist') {
    code = `THR-${customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)()}`;
  }
  if (role === 'patient') {
    code = `PAT-${customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)()}`;
    if (therapistCode) {
      const therapist = await User.findOne({ therapistCode, role: 'therapist', isDeleted: false });
      if (!therapist) {
        return next(new AppError(400, "Invalid therapist code"));
      }
      assignedTherapist = therapist._id;
    }
  }
  // Save user in database
  const user = await User.create({
    email,
    fullName,
    role,
    password: hashPassword,
    confirmOTP,
    OTPExpired,
    therapistCode: role === "therapist" ? code : undefined,
    patientCode: role === "patient" ? code : undefined,
    assignedTherapist: role === "patient" ? assignedTherapist : null,
    injuryType: role === 'patient' ? injuryType : undefined,
    specialization: role === 'therapist' ? specialization : undefined,
    bio: role === 'therapist' ? bio : undefined
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
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});


//google auth
exports.googleAuth = catchAsync(async (req, res, next) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return next(new AppError(400, "Google ID Token is required"));
  }
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    return next(new AppError(400, "Invalid or expired Google Token"));
  }

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({
    $or: [{ email }, { googleId }],
    isDeleted: false
  });
  // sign up
  if (!user) {
    user = await User.create({
      fullName: name,
      email: email,
      googleId: googleId,
      role: role || "patient",
      isConfirmed: true
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isConfirmed = true;
    await user.save({ validateBeforeSave: false });
  }

  const token = await jwtSign(
    { _id: user._id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully with Google",
    data: {
      accessToken: token,
      user
    }
  });
});