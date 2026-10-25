import { Link } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Home.css";

const STATS = [
  { icon: "fa-users", value: "500+", label: "Registered Donors" },
  { icon: "fa-heart", value: "1200+", label: "Lives Saved" },
  { icon: "fa-hospital", value: "50+", label: "Hospitals" },
  { icon: "fa-location-dot", value: "30+", label: "Cities" },
];

const WHY_DONATE = [
  {
    icon: "fa-heart-circle-plus",
    title: "Save Lives",
    text: "One donation can save multiple lives.",
  },
  {
    icon: "fa-user-group",
    title: "Help Community",
    text: "Support patients during emergencies.",
  },
  {
    icon: "fa-hand-holding-heart",
    title: "Be a Hero",
    text: "Become someone's real-life hero today.",
  },
];

const BLOOD_GROUPS = [
  { group: "A+", note: "Universal Plasma Donor" },
  { group: "A-", note: "Rare Blood Group" },
  { group: "B+", note: "Common Blood Group" },
  { group: "B-", note: "Rare Blood Group" },
  { group: "AB+", note: "Universal Recipient" },
  { group: "AB-", note: "Rare Blood Group" },
  { group: "O+", note: "Most Common Blood Group" },
  { group: "O-", note: "Universal Donor" },
];

const TESTIMONIALS = [
  {
    name: "Rahul",
    text: "The Blood Donor Finder helped me quickly find a donor during an emergency. Amazing platform!",
  },
  {
    name: "Priya",
    text: "Very easy to register and connect with donors. Highly recommended.",
  },
  {
    name: "Karthik",
    text: "A wonderful initiative that truly helps save lives.",
  },
];

const CONTACTS = [
  { icon: "fa-phone", title: "Phone", value: "+91 9876543210" },
  { icon: "fa-envelope", title: "Email", value: "support@blooddonorfinder.com" },
  { icon: "fa-location-dot", title: "Location", value: "coimbatore, Tamil Nadu" },
];

export default function Home() {
  useDocumentTitle("Blood Donor Finder");

  return (
    <div className="page page-home">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Donate Blood,
            <span> Save Lives</span>
          </h1>

          <p>
            Every blood donation can save up to three lives. Join our donor
            community today.
          </p>

          <div className="hero-buttons">
            <Link to="/become-donor" className="btn">
              Become Donor
            </Link>

            <Link to="/find-donor" className="btn-outline">
              Find Donor
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img src="/images/hero.png" alt="Blood Donation" />
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <i className={`fa-solid ${s.icon}`}></i>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ================= WHY DONATE ================= */}
      <section className="why">
        <h2>Why Donate Blood?</h2>

        <div className="cards">
          {WHY_DONATE.map((c) => (
            <div className="card" key={c.title}>
              <i className={`fa-solid ${c.icon}`}></i>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BLOOD GROUPS ================= */}
      <section className="blood-groups">
        <h2>Available Blood Groups</h2>

        <div className="blood-grid">
          {BLOOD_GROUPS.map((b) => (
            <div className="blood-card" key={b.group}>
              <h3>{b.group}</h3>
              <p>{b.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="testimonials">
        <h2>What People Say</h2>

        <div className="testimonial-container">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <i className="fa-solid fa-quote-left"></i>
              <p>"{t.text}"</p>
              <h4>- {t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact">
        <h2>Contact Us</h2>

        <div className="contact-container">
          {CONTACTS.map((c) => (
            <div className="contact-box" key={c.title}>
              <i className={`fa-solid ${c.icon}`}></i>
              <h3>{c.title}</h3>
              <p>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer tagline="Together we can save lives. Donate blood and become a hero." />
    </div>
  );
}
