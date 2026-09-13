const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      match: [
        /^(?=.*[!@#$%^&*(),.?":{}|<>])/,
        'Password must contain at least one special character'
      ]
    },
    role: {
      type: String,
      enum: ['therapist', 'patient'],
      required: [true, 'Role must be either therapist or patient']
    },
    assignedTherapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    confirmOTP: {
      type: String
    },
    OTPExpired: {
      type: Date
    },
    isConfirmed: {
      type: Boolean,
      default: false
    },
    resetToken: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;