import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Profile.css";

export default function Profile() {
  useDocumentTitle("My Profile | Blood Donor Finder");

  const { user, token } = useAuth();

  // undefined = still loading, null = not registered as a donor, object = donor record
  const [donor, setDonor] = useState(undefined);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .getMyDonorProfile(token)
      .then((data) => {
        if (!cancelled) setDonor(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setDonor(null); // logged in, but hasn't registered as a donor yet
        } else {
          console.error(err);
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  let donorStatus = "Loading...";
  if (loadError) donorStatus = "⚠️ Could not reach the server";
  else if (donor === null) donorStatus = "🔴 Not Registered";
  else if (donor) donorStatus = "🟢 Registered Donor";

  const dash = (value) => (value === undefined || value === null || value === "" ? "-" : value);

  return (
    <div className="page page-profile">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>My Profile</h1>

        <p>Manage your account and donor details.</p>
      </section>

      {/* ================= PROFILE ================= */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-image">
              <i className="fa-solid fa-user"></i>
            </div>

            <h2>{user.name}</h2>

            <p>{user.email}</p>

            <span className="status">{donorStatus}</span>
          </div>

          <div className="profile-body">
            <div className="info-box">
              <h4>
                <i className="fa-solid fa-phone"></i>{" "}
                Mobile
              </h4>
              <p>{user.mobile}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-envelope"></i>{" "}
                Email
              </h4>
              <p>{user.email}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-droplet"></i>{" "}
                Blood Group
              </h4>
              <p>{dash(donor?.bloodGroup)}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-location-dot"></i>{" "}
                City
              </h4>
              <p>{dash(donor?.city)}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-calendar"></i>{" "}
                Age
              </h4>
              <p>{dash(donor?.age)}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-weight-scale"></i>{" "}
                Weight
              </h4>
              <p>{donor ? `${donor.weight} kg` : "-"}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-venus-mars"></i>{" "}
                Gender
              </h4>
              <p>{dash(donor?.gender)}</p>
            </div>

            <div className="info-box">
              <h4>
                <i className="fa-solid fa-heart-pulse"></i>{" "}
                Availability
              </h4>
              <p>{dash(donor?.availability)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="stats-section">
        <div className="stat-card">
          <i className="fa-solid fa-user"></i>
          <h3>{donor ? "Donor" : "User"}</h3>
          <p>Account Status</p>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-droplet"></i>
          <h3>{dash(donor?.bloodGroup)}</h3>
          <p>Blood Group</p>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-location-dot"></i>
          <h3>{dash(donor?.city)}</h3>
          <p>City</p>
        </div>

        <div className="stat-card">
          <i className="fa-solid fa-circle-check"></i>
          <h3>{dash(donor?.availability)}</h3>
          <p>Availability</p>
        </div>
      </section>

      {/* ================= ACTION BUTTONS ================= */}
      <section className="action-section">
        <Link to="/become-donor" className="action-btn">
          <i className="fa-solid fa-hand-holding-droplet"></i>{" "}
          Become Donor
        </Link>

        <button
          className="action-btn secondary"
          onClick={() => alert("Edit Profile feature will be added in the next version.")}
        >
          <i className="fa-solid fa-pen"></i>{" "}
          Edit Profile
        </button>
      </section>

      <Footer tagline="Thank you for being part of our life-saving community." />
    </div>
  );
}
