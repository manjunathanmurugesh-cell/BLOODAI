
const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "Not listed",
    },
    email: {
      type: String,
      default: "Not listed",
    },
    address: {
      type: String,
      default: "Address not listed",
    },
    rating: {
      type: String,
      default: "Not available",
    },
    emergency: {
      type: String,
      default: "Please contact hospital",
    },
    map: {
      type: String,
      default: "",
    },
    // Stores Geoapify place IDs to avoid duplicate hospitals.
    osmId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    source: {
      type: String,
      default: "Geoapify",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
