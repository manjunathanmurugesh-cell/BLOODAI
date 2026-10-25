 
const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: String,
      required: true,
      index: true,
    },
    referredUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["registered", "completed"],
      default: "registered",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

referralSchema.index({ referrerId: 1, status: 1 });

module.exports = mongoose.model("Referral", referralSchema);
