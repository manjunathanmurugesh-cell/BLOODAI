
const crypto = require("crypto");
const Referral = require("../models/Referral");
const ReferralCode = require("../models/ReferralCode");

function generateCode() {
  return `BDR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function getOrCreateReferralCode(ownerId) {
  const existing = await ReferralCode.findOne({ ownerId });

  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await ReferralCode.create({
        ownerId,
        code: generateCode(),
      });
    } catch (error) {
      if (error.code !== 11000) throw error;

      const created = await ReferralCode.findOne({ ownerId });
      if (created) return created;
    }
  }

  throw new Error("Could not generate a unique referral code.");
}

async function recordReferralRegistration(referralCode, referredUserId) {
  const code = String(referralCode || "").trim().toUpperCase();

  if (!code) return null;

  const referralOwner = await ReferralCode.findOne({ code });

  if (!referralOwner) {
    throw new Error("Invalid referral code.");
  }

  if (referralOwner.ownerId === String(referredUserId)) {
    throw new Error("You cannot use your own referral code.");
  }

  const existing = await Referral.findOne({
    referredUserId: String(referredUserId),
  });

  if (existing) {
    return existing;
  }

  return Referral.create({
    referrerId: referralOwner.ownerId,
    referredUserId: String(referredUserId),
    referralCode: code,
    status: "registered",
  });
}

async function completeReferralForDonor(referredUserId) {
  return Referral.findOneAndUpdate(
    {
      referredUserId: String(referredUserId),
      status: "registered",
    },
    {
      $set: {
        status: "completed",
        completedAt: new Date(),
      },
    },
    { new: true }
  );
}

async function getReferralStats(ownerId) {
  const [totalInvited, successfulDonors] = await Promise.all([
    Referral.countDocuments({ referrerId: String(ownerId) }),
    Referral.countDocuments({
      referrerId: String(ownerId),
      status: "completed",
    }),
  ]);

  return { totalInvited, successfulDonors };
}

module.exports = {
  getOrCreateReferralCode,
  recordReferralRegistration,
  completeReferralForDonor,
  getReferralStats,
};
