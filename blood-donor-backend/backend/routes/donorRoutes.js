
const express = require("express");
const Donor = require("../models/Donor");
const auth = require("../middleware/auth");
const {
  geocodeAddress,
  getDrivingDurations,
} = require("../utils/geocode");

const {
  completeReferralForDonor,
} = require("../utils/referralService");

const router = express.Router();

// GET /api/donors
// List donors.
router.get("/", async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    return res.json(donors);
  } catch (err) {
    console.error("Get donors error:", err);
    return res.status(500).json({
      message: "Server error fetching donors",
    });
  }
});

// GET /api/donors/nearby?lat=...&lng=...
// List donors sorted by estimated driving time.
router.get("/nearby", async (req, res) => {
  try {
    const lat = Number.parseFloat(req.query.lat);
    const lng = Number.parseFloat(req.query.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Valid lat and lng are required",
      });
    }

    const allDonors = await Donor.find().sort({ createdAt: -1 });

    const locatable = allDonors.filter(
      (donor) =>
        Number.isFinite(donor.latitude) &&
        Number.isFinite(donor.longitude)
    );

    const unlocatable = allDonors.filter(
      (donor) =>
        !Number.isFinite(donor.latitude) ||
        !Number.isFinite(donor.longitude)
    );

    let durations = null;

    if (locatable.length > 0) {
      try {
        durations = await getDrivingDurations(
          { latitude: lat, longitude: lng },
          locatable.map((donor) => ({
            latitude: donor.latitude,
            longitude: donor.longitude,
          }))
        );
      } catch (geoError) {
        console.error("Driving duration error:", geoError.message);
      }
    }

    const withTimes = locatable.map((donor, index) => {
      const seconds = durations?.[index] ?? null;

      return {
        ...donor.toObject(),
        estimatedMinutes:
          seconds !== null ? Math.round(seconds / 60) : null,
      };
    });

    withTimes.sort((a, b) => {
      if (a.estimatedMinutes == null) return 1;
      if (b.estimatedMinutes == null) return -1;

      return a.estimatedMinutes - b.estimatedMinutes;
    });

    const withoutTimes = unlocatable.map((donor) => ({
      ...donor.toObject(),
      estimatedMinutes: null,
    }));

    return res.json([...withTimes, ...withoutTimes]);
  } catch (err) {
    console.error("Nearby donors error:", err);

    return res.status(500).json({
      message: "Server error finding nearby donors",
    });
  }
});

// GET /api/donors/me
// Get the logged-in user's donor profile.
router.get("/me", auth, async (req, res) => {
  try {
    const donor = await Donor.findOne({
      email: req.user.email,
    });

    if (!donor) {
      return res.status(404).json({
        message: "Not registered as a donor",
      });
    }

    return res.json(donor);
  } catch (err) {
    console.error("Get my donor profile error:", err);

    return res.status(500).json({
      message: "Server error fetching donor profile",
    });
  }
});

// POST /api/donors
// Register the logged-in user as a donor.
// A referral becomes successful only after the donor profile is saved.
router.post("/", auth, async (req, res) => {
  try {
    const existing = await Donor.findOne({
      email: req.user.email,
    });

    if (existing) {
      return res.status(409).json({
        message: "You are already registered as a donor.",
      });
    }

    const {
      bloodGroup,
      age,
      gender,
      weight,
      lastDonation,
      state,
      district,
      city,
      pincode,
      address,
      availability,
    } = req.body;

    if (
      !bloodGroup ||
      !age ||
      !gender ||
      !weight ||
      !state ||
      !district ||
      !city
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Best-effort geocoding: registration should still work if it fails.
    const addressText = [address, city, district, state]
      .filter(Boolean)
      .join(", ");

    let location = null;

    try {
      location = await geocodeAddress(addressText);
    } catch (geoError) {
      console.error("Donor geocoding failed:", geoError.message);
    }

    const donor = await Donor.create({
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.body.mobile,
      bloodGroup,
      age,
      gender,
      weight,
      lastDonation,
      state,
      district,
      city,
      pincode,
      address,
      availability: availability || "Available",
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });

    // Complete a referral only after MongoDB successfully saves the donor.
    // If referral tracking fails, don't turn a successful donor registration
    // into an API failure; log it for debugging instead.
    try {
      await completeReferralForDonor(String(req.user.id));
    } catch (referralError) {
      console.error(
        "Referral completion failed:",
        referralError.message
      );
    }

    return res.status(201).json({
      message: "Donor registered successfully",
      donor,
    });
  } catch (err) {
    console.error("Register donor error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "A donor profile already exists for this account.",
      });
    }

    return res.status(500).json({
      message: "Server error registering donor",
    });
  }
});

module.exports = router;
