const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['member', 'head', 'admin'],
      default: 'member',
    },

    profilePhoto: {
      type: String,
      default: '',
    },

    branch: {
      type: String,
      default: '',
      trim: true,
    },

    year: {
      type: String,
      default: '',
      trim: true,
    },

    bio: {
      type: String,
      default: '',
    },

    skills: {
      type: [String],
      default: [],
    },

    github: {
      type: String,
      default: '',
    },

    linkedin: {
      type: String,
      default: '',
    },

    portfolio: {
      type: String,
      default: '',
    },

    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);