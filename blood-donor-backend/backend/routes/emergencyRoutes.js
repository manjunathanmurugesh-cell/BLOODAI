const express = require("express");
const EmergencyRequest = require("../models/EmergencyRequest");

const router = express.Router();

// GET /api/emergency -> list every request, newest first
router.get("/", async (req, res) => {
  try {
    const requests = await EmergencyRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching requests" });
  }
});

// POST /api/emergency -> submit a new emergency request
router.post("/", async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      hospital,
      mobile,
      state,
      district,
      city,
      units,
      priority,
      message,
    } = req.body;

    if (!patientName || !bloodGroup || !hospital || !mobile || !units || !priority) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const request = await EmergencyRequest.create({
      patientName,
      bloodGroup,
      hospital,
      mobile,
      state,
      district,
      city,
      units,
      priority,
      message,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error submitting request" });
  }
});

module.exports = router;
