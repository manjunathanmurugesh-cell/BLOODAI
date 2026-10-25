
const express = require("express");
const jwt = require("jsonwebtoken");

const Referral = require("../models/Referral");
const {
  getOrCreateReferralCode,
  recordReferralRegistration,
  getReferralStats,
} = require("../utils/referralService");

const router = express.Router();

function requireLogin(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded._id ||
      decoded.sub;

    if (!userId) {
      return res.status(401).json({
        message: "Your login token does not contain a user ID.",
      });
    }

    req.userId = String(userId);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired login token.",
    });
  }
}

// GET /api/referrals/mine
// Returns the logged-in user's referral code and statistics.
router.get("/mine", requireLogin, async (req, res) => {
  try {
    const referral = await getOrCreateReferralCode(req.userId);
    const stats = await getReferralStats(req.userId);

    return res.json({
      referralCode: referral.code,
      referralLink: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/register?ref=${encodeURIComponent(referral.code)}`,
      ...stats,
    });
  } catch (error) {
    console.error("Referral dashboard error:", error.message);
    return res.status(500).json({
      message: "Could not load referral information.",
    });
  }
});

// POST /api/referrals/record
// Call after a referred friend has successfully created an account.
// Body: { "referralCode": "BDR-A1B2C3D4" }
router.post("/record", requireLogin, async (req, res) => {
  try {
    const referralCode = String(req.body?.referralCode || "").trim();

    if (!referralCode) {
      return res.status(400).json({
        message: "Referral code is required.",
      });
    }

    const referral = await recordReferralRegistration(
      referralCode,
      req.userId
    );

    return res.status(201).json({
      message: "Referral registration recorded.",
      referral,
    });
  } catch (error) {
    const clientError = [
      "Invalid referral code.",
      "You cannot use your own referral code.",
    ].includes(error.message);

    return res.status(clientError ? 400 : 500).json({
      message: error.message || "Could not record referral.",
    });
  }
});

// GET /api/referrals/history
router.get("/history", requireLogin, async (req, res) => {
  try {
    const referrals = await Referral.find({
      referrerId: req.userId,
    })
      .select("referralCode status completedAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    console.error("Referral history error:", error.message);
    return res.status(500).json({
      message: "Could not load referral history.",
    });
  }
});

module.exports = router;
