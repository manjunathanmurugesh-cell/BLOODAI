require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const referralRoutes = require("./routes/referralRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/referrals", referralRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
