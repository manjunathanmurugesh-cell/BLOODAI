
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
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

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // Password is stored as a bcrypt hash.
    password: {
      type: String,
      required: true,
    },

    // Hashed login OTP
    loginOtpHash: {
      type: String,
      default: null,
      select: false,
    },

    // OTP expiry time
    loginOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    // Number of incorrect OTP attempts
    loginOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
