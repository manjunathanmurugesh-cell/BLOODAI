import { useCallback, useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api } from "../services/api.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Emergency.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY_FORM = {
  patientName: "",
  bloodGroup: "",
  hospital: "",
  mobile: "",
  state: "",
  district: "",
  city: "",
  units: "",
  priority: "",
  message: "",
};

const TIPS = [
  {
    icon: "fa-heart-pulse",
    title: "Stay Calm",
    text: "Stay calm and immediately contact the nearest hospital or blood bank.",
  },
  {
    icon: "fa-droplet",
    title: "Know the Blood Group",
    text: "Ensure the patient's blood group is confirmed before requesting blood.",
  },
  {
    icon: "fa-hospital",
    title: "Hospital Support",
    text: "Keep the hospital informed while searching for available donors.",
  },
];

const CONTACTS = [
  { icon: "fa-phone", title: "Emergency Helpline", value: "102" },
  { icon: "fa-truck-medical", title: "Ambulance", value: "108" },
  { icon: "fa-envelope", title: "Email Support", value: "blooddonorfinder@gmail.com" },
];

export default function Emergency() {
  useDocumentTitle("Emergency Blood Request");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.getEmergencyRequests();
      setRequests(data);
      setLoadError("");
    } catch (err) {
      console.error(err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createEmergencyRequest(form);
      alert("✅ Emergency Request Submitted Successfully!");
      setForm(EMPTY_FORM);
      loadRequests();
    } catch (err) {
      alert(err.message || "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-emergency">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>Emergency Blood Request</h1>

          <p>
            Need blood urgently? Fill out the request form below. Our donor
            network will help you connect with available donors.
          </p>
        </div>
      </section>

      {/* ================= FORM ================= */}
      <section className="request-section">
        <div className="request-card">
          <h2>
            <i className="fa-solid fa-triangle-exclamation"></i>{" "}
            Request Blood
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="input-box">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  placeholder="Enter Patient Name"
                  value={form.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>Blood Group</label>

                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="input-box">
                <label>Hospital Name</label>
                <input
                  type="text"
                  name="hospital"
                  placeholder="Enter Hospital Name"
                  value={form.hospital}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter Contact Number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter State"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="Enter District"
                  value={form.district}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>Blood Units Required</label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  placeholder="Enter Units"
                  value={form.units}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-box">
                <label>Priority</label>

                <select name="priority" value={form.priority} onChange={handleChange} required>
                  <option value="">Select Priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="input-box full-width">
                <label>Message</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Describe the emergency..."
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              <i className="fa-solid fa-paper-plane"></i>{" "}
              {submitting ? "Sending..." : "Send Emergency Request"}
            </button>
          </form>
        </div>
      </section>

      {/* ================= RECENT REQUESTS ================= */}
      <section className="recent-section">
        <h2>Recent Emergency Requests</h2>

        <div className="request-grid">
          {loading && (
            <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px" }}>
              Loading requests...
            </div>
          )}

          {loadError && (
            <div
              style={{
                textAlign: "center",
                gridColumn: "1/-1",
                padding: "40px",
                color: "#d32f2f",
              }}
            >
              ⚠️ {loadError}
            </div>
          )}

          {!loading && !loadError && requests.length === 0 && (
            <div
              style={{
                textAlign: "center",
                gridColumn: "1/-1",
                padding: "40px",
                fontSize: "20px",
                color: "#d32f2f",
              }}
            >
              🚨 No Emergency Requests
            </div>
          )}

          {requests.map((request) => (
            <div className="request-card-item" key={request._id}>
              <h3>{request.patientName}</h3>

              <p>
                <i className="fa-solid fa-droplet"></i>{" "}
                Blood Group : <strong>{request.bloodGroup}</strong>
              </p>

              <p>
                <i className="fa-solid fa-hospital"></i>{" "}
                {request.hospital}
              </p>

              <p>
                <i className="fa-solid fa-location-dot"></i>{" "}
                {request.city}, {request.district}, {request.state}
              </p>

              <p>
                <i className="fa-solid fa-phone"></i>{" "}
                {request.mobile}
              </p>

              <p>
                <i className="fa-solid fa-box"></i>{" "}
                Units Required : {request.units}
              </p>

              <p>
                <i className="fa-solid fa-message"></i>{" "}
                {request.message}
              </p>

              <span className={`priority ${request.priority.toLowerCase()}`}>
                {request.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EMERGENCY TIPS ================= */}
      <section className="tips-section">
        <h2>Emergency Tips</h2>

        <div className="tips-grid">
          {TIPS.map((tip) => (
            <div className="tip-card" key={tip.title}>
              <i className={`fa-solid ${tip.icon}`}></i>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact-section">
        <h2>Emergency Contacts</h2>

        <div className="contact-grid">
          {CONTACTS.map((c) => (
            <div className="contact-card" key={c.title}>
              <i className={`fa-solid ${c.icon}`}></i>
              <h3>{c.title}</h3>
              <p>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer tagline="Saving lives together through quick blood donor connections." />
    </div>
  );
}
