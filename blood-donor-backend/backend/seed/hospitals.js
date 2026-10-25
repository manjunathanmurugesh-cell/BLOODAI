// One-time script: loads the sample hospital list into MongoDB.
// Run with: npm run seed

require("dotenv").config();
const connectDB = require("../config/db");
const Hospital = require("../models/Hospital");
const mongoose = require("mongoose");

const hospitals = [
  {
    name: "Apollo Hospital",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    phone: "+91 9876543210",
    email: "apollo@example.com",
    address: "Greams Road, Chennai",
    rating: "4.8",
    emergency: "24×7 Emergency",
    map: "https://maps.google.com/?q=Apollo Hospital Chennai",
  },
  {
    name: "MIOT International",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    phone: "+91 9123456789",
    email: "miot@example.com",
    address: "Manapakkam, Chennai",
    rating: "4.7",
    emergency: "Emergency Available",
    map: "https://maps.google.com/?q=MIOT International Chennai",
  },
  {
    name: "CMC Hospital",
    state: "Tamil Nadu",
    district: "Vellore",
    city: "Vellore",
    phone: "+91 9012345678",
    email: "cmc@example.com",
    address: "Vellore, Tamil Nadu",
    rating: "4.9",
    emergency: "24×7 Emergency",
    map: "https://maps.google.com/?q=CMC Hospital Vellore",
  },
  {
    name: "Kauvery Hospital",
    state: "Tamil Nadu",
    district: "Trichy",
    city: "Trichy",
    phone: "+91 9876501234",
    email: "kauvery@example.com",
    address: "Trichy, Tamil Nadu",
    rating: "4.6",
    emergency: "Emergency Available",
    map: "https://maps.google.com/?q=Kauvery Hospital Trichy",
  },
];

async function seed() {
  await connectDB();

  await Hospital.deleteMany({});
  await Hospital.insertMany(hospitals);

  console.log(`✅ Seeded ${hospitals.length} hospitals`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
