const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },

    bloodGroup: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number, required: true },
    lastDonation: { type: String },

    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String },
    address: { type: String },

    availability: { type: String, default: "Available" },

    // Filled in automatically by geocoding the donor's address (may be null
    // if geocoding failed or ORS_API_KEY isn't configured).
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);
