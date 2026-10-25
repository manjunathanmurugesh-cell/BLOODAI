
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../models/User");
const ReferralCode = require("../models/ReferralCode");
const {
  recordReferralRegistration,
} = require("../utils/referralService");

const router = express.Router();

// =====================================
// EMAIL CONFIGURATION
// =====================================
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT || 587) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// =====================================
// JWT TOKEN
// =====================================
function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =====================================
// PUBLIC USER DETAILS
// =====================================
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
  };
}

// =====================================
// SEND LOGIN OTP EMAIL
// =====================================
async function sendLoginOtp(user, otp) {
  await transporter.sendMail({
    from: `"Blood Donor Finder" <${
      process.env.MAIL_FROM || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: "Blood Donor Finder - Login OTP",
    text: `Hello ${user.name}, your login OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#b91c1c">Blood Donor Finder</h2>
        <h3>Login Verification</h3>
        <p>Hello ${user.name},</p>
        <p>Use this OTP to complete your login:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#b91c1c;padding:16px 0">
          ${otp}
        </div>
        <p>This OTP expires in <strong>5 minutes</strong>.</p>
        <p>Never share this code with anyone.</p>
        <p>If you did not request this login, you can ignore this email.</p>
        <p>Regards,<br/><strong>Blood Donor Finder</strong></p>
      </div>
    `,
  });
}

// =====================================
// REGISTER
// POST /api/auth/register
// =====================================
router.post("/register", async (req, res) => {
  let createdUserId = null;
  let savedReferralId = null;

  try {
    const {
      name,
      email,
      mobile,
      password,
      referralCode: submittedReferralCode,
    } = req.body || {};

    const referralCode = String(submittedReferralCode || "")
      .trim()
      .toUpperCase();

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !mobile?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Validate referral code before creating the user
    if (referralCode) {
      const validReferral = await ReferralCode.findOne({
        code: referralCode,
      });

      if (!validReferral) {
        return res.status(400).json({
          message: "Invalid referral code",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,
    });

    createdUserId = user._id;

    // Record the referral against the newly created account
    if (referralCode) {
      const referral = await recordReferralRegistration(
        referralCode,
        String(user._id)
      );

      savedReferralId = referral?._id || null;
    }

    return res.status(201).json({
      message:
        "Registration successful. Please log in to verify your email OTP.",
      user: publicUser(user),
      referralRecorded: Boolean(savedReferralId),
    });
  } catch (err) {
    console.error("Registration error:", err);

    // Roll back a partially created referral/user if tracking failed.
    // Avoid leaving a newly created account without its intended referral.
    if (createdUserId) {
      try {
        if (savedReferralId) {
          const Referral = require("../models/Referral");
          await Referral.deleteOne({ _id: savedReferralId });
        }

        await User.deleteOne({ _id: createdUserId });
      } catch (cleanupError) {
        console.error("Registration cleanup error:", cleanupError);
      }
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email or referral record already exists",
      });
    }

    const clientErrors = [
      "Invalid referral code.",
      "You cannot use your own referral code.",
    ];

    return res.status(clientErrors.includes(err.message) ? 400 : 500).json({
      message: err.message || "Server error during registration",
    });
  }
});

// =====================================
// LOGIN - VERIFY PASSWORD + SEND OTP
// POST /api/auth/login
// =====================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
      console.error("MAIL_USER or MAIL_PASSWORD missing in .env");

      return res.status(500).json({
        message: "Email service is not configured",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate a secure six-digit OTP
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);

    user.loginOtpHash = otpHash;
    user.loginOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.loginOtpAttempts = 0;

    await user.save();

    try {
      await sendLoginOtp(user, otp);
    } catch (mailError) {
      console.error("OTP email sending error:", mailError);

      user.loginOtpHash = null;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();

      return res.status(502).json({
        message:
          "Could not send OTP email. Check email configuration and try again.",
      });
    }

    // JWT is issued only after OTP verification
    return res.status(200).json({
      message: "OTP sent to your registered email address",
      requiresOtp: true,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// =====================================
// VERIFY LOGIN OTP
// POST /api/auth/verify-login-otp
// =====================================
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email?.trim() || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit OTP",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts");

    if (
      !user ||
      !user.loginOtpHash ||
      !user.loginOtpExpiresAt
    ) {
      return res.status(400).json({
        message: "No active OTP. Please log in again.",
      });
    }

    // Check OTP expiry
    if (user.loginOtpExpiresAt.getTime() <= Date.now()) {
      user.loginOtpHash = null;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP expired. Please log in again.",
      });
    }

    // Limit failed attempts
    if (user.loginOtpAttempts >= 5) {
      user.loginOtpHash = null;
      user.loginOtpExpiresAt = null;
      user.loginOtpAttempts = 0;
      await user.save();

      return res.status(429).json({
        message: "Too many incorrect OTP attempts. Please log in again.",
      });
    }

    const otpMatches = await bcrypt.compare(
      String(otp),
      user.loginOtpHash
    );

    if (!otpMatches) {
      user.loginOtpAttempts += 1;

      const attemptsRemaining = Math.max(
        0,
        5 - user.loginOtpAttempts
      );

      if (user.loginOtpAttempts >= 5) {
        user.loginOtpHash = null;
        user.loginOtpExpiresAt = null;
        user.loginOtpAttempts = 0;
        await user.save();

        return res.status(429).json({
          message: "Too many incorrect attempts. Please log in again.",
          attemptsRemaining: 0,
        });
      }

      await user.save();

      return res.status(401).json({
        message: "Incorrect OTP",
        attemptsRemaining,
      });
    }

    // OTP verified successfully: clear OTP fields
    user.loginOtpHash = null;
    user.loginOtpExpiresAt = null;
    user.loginOtpAttempts = 0;
    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("OTP verification error:", err);

    return res.status(500).json({
      message: "Server error during OTP verification",
    });
  }
});

module.exports = router;
