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
const sendEmail = require("../utils/SendEmail");
const template = require("../utils/emailTemplate");

const jwtSign = promisify(jwt.sign);

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, fullName, role, injuryType, specialization, bio, therapistCode } = req.body;

  if (!email || !password || !fullName || !role) {
    return next(new AppError(400, "Please provide full name, email, password, and role"));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const findUser = await User.findOne({ email: normalizedEmail, isDeleted: false });
  if (findUser) {
    if (findUser.isConfirmed) {
      return next(new AppError(400, "This email is already registered. Please sign in instead."));
    }

    // refresh OTP
    const otp = customAlphabet("0123456789", 6)();
    const saltRounds = +process.env.SALT_ROUNDS || 10;
    const confirmOTP = await bcrypt.hash(otp, saltRounds);
    const OTPExpired = Date.now() + 10 * 60 * 1000;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    findUser.fullName = fullName.trim();
    findUser.role = role;
    findUser.password = hashPassword;
    findUser.confirmOTP = confirmOTP;
    findUser.OTPExpired = OTPExpired;

    if (role === 'patient') {
      findUser.injuryType = injuryType;
      if (therapistCode?.trim()) {
        const therapist = await User.findOne({ therapistCode: therapistCode.trim(), role: 'therapist', isDeleted: false });
        if (therapist) {
          findUser.assignedTherapist = therapist._id;
        }
      }
    } else if (role === 'therapist') {
      findUser.specialization = specialization;
      findUser.bio = bio;
    }

    await findUser.save({ validateBeforeSave: false });

    console.log(`\n========================================\n[AUTH OTP CODE] Verification OTP for ${normalizedEmail}: ${otp}\n========================================\n`);

    // Send OTP to email 
    sendEmail(normalizedEmail, "Confirm Email", template(otp, fullName, "Confirm Email"));

    return res.status(200).json({
      success: true,
      message: "Account updated. Please confirm your email using the OTP sent.",
      data: {
        _id: findUser._id,
        email: findUser.email,
        fullName: findUser.fullName,
        role: findUser.role,
        therapistCode: findUser.therapistCode,
        patientCode: findUser.patientCode
      }
    });
  }

  // Hash password
  const saltRounds = +process.env.SALT_ROUNDS || 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);

  // Generate OTP
  const otp = customAlphabet("0123456789", 6)();
  const confirmOTP = await bcrypt.hash(otp, saltRounds);
  const OTPExpired = Date.now() + 10 * 60 * 1000;

  let assignedTherapist = null;
  let code;
  if (role === 'therapist') {
    code = `THR-${customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)()}`;
  }
  if (role === 'patient') {
    code = `PAT-${customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)()}`;
    if (therapistCode?.trim()) {
      const therapist = await User.findOne({ therapistCode: therapistCode.trim(), role: 'therapist', isDeleted: false });
      if (!therapist) {
        return next(new AppError(400, "Invalid therapist code"));
      }
      assignedTherapist = therapist._id;
    }
  }

  // Save user in database
  const user = await User.create({
    email: normalizedEmail,
    fullName: fullName.trim(),
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

  console.log(`\n========================================\n[AUTH OTP CODE] Verification OTP for ${normalizedEmail}: ${otp}\n========================================\n`);

  // Send OTP to email 
  sendEmail(normalizedEmail, "Confirm Email", template(otp, fullName, "Confirm Email"));

  // Hide sensitive response data
  user.isDeleted = undefined;
  user.confirmOTP = undefined;
  user.OTPExpired = undefined;
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User registered successfully. Verification code sent.",
    data: user
  });
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
  const { email, confirmOTP } = req.body;

  if (!email || !confirmOTP) {
    return next(new AppError(400, "Email and OTP code are required"));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const findUser = await User.findOne({ isDeleted: false, email: normalizedEmail });
  if (!findUser) return next(new AppError(400, "This email doesn't exist please signup first!"));

  if (findUser.isConfirmed) return next(new AppError(400, "This email is already active. Please log in."));

  const check = await bcrypt.compare(confirmOTP.trim(), findUser.confirmOTP || "");
  if (!check || findUser.OTPExpired < Date.now()) {
    return next(new AppError(400, "Invalid or expired OTP code"));
  }

  findUser.isConfirmed = true;
  findUser.confirmOTP = undefined;
  findUser.OTPExpired = undefined;
  await findUser.save({ validateBeforeSave: false });

  const token = await jwtSign(
    { _id: findUser._id, role: findUser.role },
    process.env.SECRET_KEY || "physioprogress_fallback_secret_key_2026",
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Email confirmed successfully! Logging you in...",
    data: {
      accessToken: token,
      user: {
        _id: findUser._id,
        email: findUser.email,
        fullName: findUser.fullName,
        role: findUser.role,
        therapistCode: findUser.therapistCode,
        patientCode: findUser.patientCode
      }
    }
  });
});

exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError(400, "Email is required"));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const findUser = await User.findOne({ isDeleted: false, email: normalizedEmail });

  if (!findUser) {
    return next(new AppError(404, "This email is not registered. Please sign up first."));
  }

  if (findUser.isConfirmed) {
    return next(new AppError(400, "This email is already verified. Please log in."));
  }

  const saltRounds = +process.env.SALT_ROUNDS || 10;
  const otp = customAlphabet("0123456789", 6)();
  const confirmOTP = await bcrypt.hash(otp, saltRounds);
  const OTPExpired = Date.now() + 10 * 60 * 1000;

  findUser.confirmOTP = confirmOTP;
  findUser.OTPExpired = OTPExpired;
  await findUser.save({ validateBeforeSave: false });

  console.log(`\n========================================\n[RESEND OTP] New OTP for ${normalizedEmail}: ${otp}\n========================================\n`);

  sendEmail(normalizedEmail, "Verify Your Email", template(otp, findUser.fullName, "Email Verification"));

  res.status(200).json({
    success: true,
    message: "A new verification code has been sent to your email."
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new AppError(400, "Please provide email and password"));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const findUser = await User.findOne({ isDeleted: false, email: normalizedEmail });
  if (!findUser) return next(new AppError(400, "Invalid email or password"));

  if (!findUser.isConfirmed) {
    return next(new AppError(400, "This email is not yet confirmed. Please verify your email with the OTP."));
  }

  const check = await bcrypt.compare(password, findUser.password);
  if (!check) return next(new AppError(400, "Invalid email or password"));

  const token = await jwtSign(
    { _id: findUser._id, role: findUser.role },
    process.env.SECRET_KEY || "physioprogress_fallback_secret_key_2026",
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken: token,
      user: {
        _id: findUser._id,
        email: findUser.email,
        fullName: findUser.fullName,
        role: findUser.role,
        therapistCode: findUser.therapistCode,
        patientCode: findUser.patientCode
      }
    }
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const findUser = await User.findOne({ isDeleted: false, email: email?.toLowerCase().trim() });
  if (!findUser) return next(new AppError(404, "This email is not found"));

  const resetToken = crypto.randomBytes(32).toString("hex");
  findUser.resetToken = resetToken;
  await findUser.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
  const link = `${frontendUrl}/auth/reset-password/${resetToken}`;
  console.log(`\n========================================\n[RESET PASSWORD LINK] For ${findUser.email}:\n${link}\n========================================\n`);

  sendEmail(findUser.email, "Reset Password", template(link, findUser.fullName, "Reset Password"));

  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email.",
    data: {
      resetToken,
      resetLink: link
    }
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const findUser = await User.findOne({ isDeleted: false, resetToken: token });
  if (!findUser) return next(new AppError(400, "The reset Token is invalid or expired"));

  if (password.length < 6) return next(new AppError(400, "Password must be 6 characters or more"));

  const hashPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS || 10);
  findUser.password = hashPassword;
  findUser.resetToken = undefined;
  await findUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully"
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password -confirmOTP");

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Google OAuth
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
    $or: [{ email: email.toLowerCase() }, { googleId }],
    isDeleted: false
  });

  // sign up
  if (!user) {
    user = await User.create({
      fullName: name,
      email: email.toLowerCase(),
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
    process.env.SECRET_KEY || "physioprogress_fallback_secret_key_2026",
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