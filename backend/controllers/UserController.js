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
  const user = await User.findOne({ isDeleted: false, _id: req.params.id }).populate('assignedTherapist', 'fullName email profilePicture  specialization bio');
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

  if (req.body.role === 'patient') {
    delete req.body.specialization;
  } else if (req.body.role === 'therapist') {
    delete req.body.injuryType;
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

  const existingUser = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!existingUser) return next(new AppError(404, `No user found with this id ${req.params.id}`));

  const userRole = req.body.role || existingUser.role;

  if (userRole === 'patient') {
    delete req.body.specialization;
    delete req.body.bio;
  } else if (userRole === 'therapist') {
    delete req.body.injuryType;
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { ...req.body },
    { returnDocument: "after", runValidators: true }
  );

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

exports.assignTherapist = catchAsync(async (req, res, next) => {
  const { therapistId } = req.body;

  const therapist = await User.findOne({
    _id: therapistId,
    role: "therapist",
    isDeleted: false
  });

  if (!therapist) {
    return next(new AppError(404, "Therapist not found"));
  }

  const patient = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      role: "patient",
      isDeleted: false
    },
    {
      assignedTherapist: therapistId
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!patient) {
    return next(new AppError(404, "Patient not found"));
  }

  res.status(200).json({
    success: true,
    message: "Therapist assigned successfully",
    data: patient
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.role) {
    return next(new AppError(400, "This route is not for password or role updates."));
  }

  const allowedFields = ['fullName', 'injuryType', 'specialization', 'bio', 'profilePicture'];
  const filteredBody = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  if (req.user.role === 'patient') {
    delete filteredBody.specialization;
    delete filteredBody.bio;
  } else if (req.user.role === 'therapist') {
    delete filteredBody.injuryType;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody,
    { returnDocument: "after", runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});


exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError(400, "Please upload an image file"));
  }

  const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../middlewares/cloudinary");

  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "physioprogress/profiles");

  const currentUser = await User.findById(req.user._id);

  if (currentUser.profilePicture && currentUser.profilePicture.publicId) {
    await deleteFromCloudinary(currentUser.profilePicture.publicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePicture: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      }
    },
    { returnDocument: "after", runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile picture uploaded successfully",
    data: updatedUser
  });
});

exports.assignPatient = catchAsync(async (req, res, next) => {
  const { patientCode } = req.body;
  if (!patientCode) {
    return next(new AppError(400, "Patient code is required"));
  }
  if (req.user.role !== 'therapist') {
    return next(new AppError(403, "Only therapists can assign patients"));
  }
  const patient = await User.findOne({
    patientCode,
    role: "patient",
    isDeleted: false
  });
  if (!patient) {
    return next(new AppError(404, "Patient not found"));
  }
  if (patient.assignedTherapist) {
    return next(new AppError(400, "Patient is already assigned to a therapist"));
  }
  patient.assignedTherapist = req.user._id;
  await patient.save();

  res.status(200).json({
    success: true,
    message: "Patient assigned successfully",
    data: patient
  });
})

exports.getUnassignedPatients = catchAsync(async (req, res, next) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter = await User.find({
    role: "patient",
    assignedTherapist: null,
    isDeleted: false
  })
  const [patients, totalResults] = await Promise.all([
    User.find(filter).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: patients.length,
    totalResults,
    totalPages: Math.ceil(totalResults / limit),
    currentPage: page,
    data: patients
  });
})
