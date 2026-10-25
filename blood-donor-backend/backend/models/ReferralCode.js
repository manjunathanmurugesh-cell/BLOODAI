
const mongoose = require("mongoose");

const referralCodeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReferralCode", referralCodeSchema);
