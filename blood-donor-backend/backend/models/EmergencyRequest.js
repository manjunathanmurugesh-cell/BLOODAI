const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    hospital: { type: String, required: true },
    mobile: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    units: { type: Number, required: true },
    priority: { type: String, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);
