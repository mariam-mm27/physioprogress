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
      required: function() {
      return !this.googleId; },
      minlength: [6, 'Password must be at least 6 characters long'],
      match: [
        /^(?=.*[!@#$%^&*(),.?":{}|<>])/,
        'Password must contain at least one special character'
      ]
    },
    googleId: {
    type: String,
    unique: true,
    sparse: true 
    },
    role: {
      type: String,
      enum: ['therapist', 'patient'],
      required: [true, 'Role must be either therapist or patient']
    },
    injuryType: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (value && this.role !== 'patient') return false;
          return true;
        },
        message: 'injuryType can only be set for patients'
      }
    },
    specialization: {
      type: [String],
      validate: {
        validator: function (value) {
          if (value && value.length > 0 && this.role !== 'therapist') return false;
          return true;
        },
        message: 'specialization can only be set for therapists'
      }
    },
    profilePicture: {
      type: String,
      default: null
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