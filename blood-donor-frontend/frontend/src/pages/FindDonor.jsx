import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api } from "../services/api.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./FindDonor.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY_FILTERS = { bloodGroup: "", state: "", district: "", city: "" };

function DonorCard({ donor }) {
  const available = donor.availability === "Available";

  return (
    <div className="donor-card">
      <div className="card-header">
        <div className="profile">
          <div className="avatar">
            <i className="fa-solid fa-user"></i>
          </div>

          <div>
            <h3>{donor.name}</h3>

            <span className="location">
              <i className="fa-solid fa-location-dot"></i>{" "}
              {donor.city}
            </span>
          </div>
        </div>

        <span className="blood-badge">{donor.bloodGroup}</span>
      </div>

      {donor.estimatedMinutes != null && (
        <div style={{ padding: "6px 15px", fontWeight: "bold", color: "#d32f2f" }}>
          <i className="fa-solid fa-car"></i>{" "}
          ~{donor.estimatedMinutes} min drive away
        </div>
      )}

      <div className="card-body">
        <p>
          <i className="fa-solid fa-phone"></i>{" "}
          {donor.mobile}
        </p>

        <p>
          <i className="fa-solid fa-envelope"></i>{" "}
          {donor.email}
        </p>

        <p>
          <i className="fa-solid fa-city"></i>{" "}
          {donor.state}
        </p>

        <span className={`status ${available ? "available" : "unavailable"}`}>
          {available ? "🟢 Available" : "🔴 Not Available"}
        </span>
      </div>

      <div className="card-footer">
        <a href={`tel:${donor.mobile}`} className="call-btn">
          <i className="fa-solid fa-phone"></i>{" "}
          Call
        </a>

        <a href={`mailto:${donor.email}`} className="email-btn">
          <i className="fa-solid fa-envelope"></i>{" "}
          Email
        </a>
      </div>
    </div>
  );
}

export default function FindDonor() {
  useDocumentTitle("Find Blood Donor");

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // `filters` = what's typed in the boxes; `applied` = what the Search button last applied
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const [nearMeStatus, setNearMeStatus] = useState("");

  // ---- Load donors from the API ----
  useEffect(() => {
    let cancelled = false;

    api
      .getDonors()
      .then((data) => {
        if (!cancelled) setDonors(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Search (same matching rules as the original find-donar.js) ----
  const visibleDonors = useMemo(() => {
    const bloodGroup = applied.bloodGroup.toLowerCase();
    const state = applied.state.trim().toLowerCase();
    const district = applied.district.trim().toLowerCase();
    const city = applied.city.trim().toLowerCase();

    return donors.filter(
      (d) =>
        (bloodGroup === "" || d.bloodGroup.toLowerCase() === bloodGroup) &&
        (state === "" || d.state.toLowerCase().includes(state)) &&
        (district === "" || d.district.toLowerCase().includes(district)) &&
        (city === "" || d.city.toLowerCase().includes(city))
    );
  }, [donors, applied]);

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ---- Find Near Me (driving time) ----
  function handleNearMe() {
    if (!navigator.geolocation) {
      setNearMeStatus("❌ Your browser doesn't support location access.");
      return;
    }

    setNearMeStatus("📍 Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setNearMeStatus("🚗 Calculating driving times...");

        try {
          const nearbyDonors = await api.getNearbyDonors(latitude, longitude);

          setDonors(nearbyDonors);
          setFilters(EMPTY_FILTERS);
          setApplied(EMPTY_FILTERS);

          const anyTimes = nearbyDonors.some((d) => d.estimatedMinutes != null);

          setNearMeStatus(
            anyTimes
              ? "✅ Sorted by driving time from your location."
              : "⚠️ Driving times aren't available right now (donor locations may not be set up yet)."
          );
        } catch (err) {
          console.error(err);
          setNearMeStatus("⚠️ Could not reach the server. Is the backend running?");
        }
      },
      (error) => {
        console.error(error);
        setNearMeStatus(
          "❌ Location permission denied. Please allow location access and try again."
        );
      }
    );
  }

  return (
    <div className="page page-find-donor">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>Find Blood Donors</h1>

        <p>Search donors instantly by blood group and location.</p>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="search-section">
        <div className="search-card">
          <h2>
            <i className="fa-solid fa-magnifying-glass"></i>{" "}
            Search Donor
          </h2>

          <div className="search-grid">
            <div className="input-box">
              <label>Blood Group</label>

              <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange}>
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="input-box">
              <label>State</label>
              <input
                type="text"
                name="state"
                placeholder="Enter State"
                value={filters.state}
                onChange={handleFilterChange}
              />
            </div>

            <div className="input-box">
              <label>District</label>
              <input
                type="text"
                name="district"
                placeholder="Enter District"
                value={filters.district}
                onChange={handleFilterChange}
              />
            </div>

            <div className="input-box">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="Enter City"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="search-btn-area">
            <button onClick={() => setApplied(filters)}>
              <i className="fa-solid fa-magnifying-glass"></i>{" "}
              Search Donor
            </button>{" "}

            <button type="button" onClick={handleNearMe}>
              <i className="fa-solid fa-location-crosshairs"></i>{" "}
              Find Near Me (Driving Time)
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "10px" }}>{nearMeStatus}</p>
        </div>
      </section>

      {/* ================= RESULT ================= */}
      <section className="donor-section">
        <h2>Available Donors</h2>

        <div className="donor-grid">
          {loading && (
            <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px" }}>
              Loading donors...
            </div>
          )}

          {loadError && (
            <div
              style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px", color: "red" }}
            >
              ⚠️ {loadError}
            </div>
          )}

          {!loading && !loadError && visibleDonors.length === 0 && (
            <div
              style={{
                textAlign: "center",
                gridColumn: "1/-1",
                padding: "40px",
                fontSize: "20px",
                color: "red",
              }}
            >
              ❌ No Donors Found
            </div>
          )}

          {visibleDonors.map((donor) => (
            <DonorCard key={donor._id} donor={donor} />
          ))}
        </div>
      </section>

      <Footer tagline="Connecting blood donors with people in need. Every donation can save a life." />
    </div>
  );
}
