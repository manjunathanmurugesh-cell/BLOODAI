
import { useState } from "react";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api } from "../services/api.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Hospitals.css";

const EMPTY_FILTERS = {
  state: "",
  district: "",
  city: "",
  hospitalName: "",
};

export default function Hospitals() {
  useDocumentTitle("Hospital Directory | Blood Donor Finder");

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [source, setSource] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  function handleChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSearch(e) {
    e.preventDefault();

    const searchFilters = {
      state: filters.state.trim(),
      district: filters.district.trim(),
      city: filters.city.trim(),
      hospitalName: filters.hospitalName.trim(),
    };

    if (
      !searchFilters.city &&
      !searchFilters.district &&
      !searchFilters.state
    ) {
      setLoadError("Please enter at least a city, district, or state.");
      setHospitals([]);
      setSearched(false);
      setSource("");
      return;
    }

    setLoading(true);
    setSearched(true);
    setLoadError("");
    setSource("");
    setHospitals([]);

    try {
      const result = await api.searchHospitals(searchFilters);

      // Support either an array response or an API response object.
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.hospitals)
            ? result.hospitals
            : [];

      // Apply optional hospital-name filtering on the returned results.
      const nameFilter = searchFilters.hospitalName.toLowerCase();

      const filteredList = nameFilter
        ? list.filter((hospital) =>
            String(hospital?.name || "")
              .toLowerCase()
              .includes(nameFilter)
          )
        : list;

      setHospitals(filteredList);
      setSource(
        Array.isArray(result)
          ? "Geoapify"
          : result?.source || "Geoapify"
      );

      if (filteredList.length === 0) {
        setLoadError(
          nameFilter
            ? `No hospital matching "${searchFilters.hospitalName}" was found. Try clearing Hospital Name.`
            : "No hospitals were returned for this location. Check the city, district, or state."
        );
      }
    } catch (err) {
      console.error("Hospital search failed:", err);

      setHospitals([]);
      setSource("");
      setLoadError(
        err?.message || "Could not search hospitals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-hospitals">
      <Navbar />

      <section className="hero">
        <h1>Hospital Directory</h1>
        <p>
          Find hospitals and emergency medical centers in the location you
          enter.
        </p>
      </section>

      <section className="search-section">
        <form className="search-card" onSubmit={handleSearch}>
          <h2>
            <i className="fa-solid fa-hospital"></i> Search Hospitals
          </h2>

          <div className="search-grid">
            <div className="input-box">
              <label htmlFor="hospital-state">State</label>
              <input
                id="hospital-state"
                type="text"
                name="state"
                placeholder="e.g. Tamil Nadu"
                value={filters.state}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="hospital-district">District</label>
              <input
                id="hospital-district"
                type="text"
                name="district"
                placeholder="e.g. Coimbatore"
                value={filters.district}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="hospital-city">City</label>
              <input
                id="hospital-city"
                type="text"
                name="city"
                placeholder="e.g. Mettupalayam"
                value={filters.city}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <label htmlFor="hospital-name">Hospital Name (optional)</label>
              <input
                id="hospital-name"
                type="text"
                name="hospitalName"
                placeholder="Leave blank to show all"
                value={filters.hospitalName}
                onChange={handleChange}
              />
            </div>
          </div>

          <p style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
            Hospital listings are searched using Geoapify. Leave Hospital Name
            blank to show all matching hospitals and clinics returned for the
            location.
          </p>

          <div className="search-btn-area">
            <button type="submit" disabled={loading}>
              <i className="fa-solid fa-magnifying-glass"></i>{" "}
              {loading ? "Searching hospitals..." : "Search Hospital"}
            </button>
          </div>
        </form>
      </section>

      <section className="hospital-section">
        <h2>Available Hospitals</h2>

        {source && (
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: 13,
            }}
          >
            Source: {source}
            {source.toLowerCase() === "geoapify" &&
              ". Map/place data © OpenStreetMap contributors where applicable."}
          </p>
        )}

        {loading && (
          <h3 style={{ textAlign: "center" }}>
            Searching for hospitals in your location...
          </h3>
        )}

        {!loading && loadError && (
          <h3
            role="alert"
            style={{
              textAlign: "center",
              color: "#d71920",
              padding: 20,
            }}
          >
            ⚠️ {loadError}
          </h3>
        )}

        {!loading && !loadError && !searched && (
          <h3 style={{ textAlign: "center", color: "#555" }}>
            Enter a location above and click Search Hospital.
          </h3>
        )}

        {!loading && !loadError && searched && hospitals.length > 0 && (
          <div className="hospital-grid">
            {hospitals.map((hospital, index) => (
              <div
                className="hospital-card"
                key={
                  hospital.osmId ||
                  hospital._id ||
                  `${hospital.name}-${hospital.latitude}-${hospital.longitude}-${index}`
                }
              >
                <div className="hospital-header">
                  <div>
                    <h3>{hospital.name || "Hospital"}</h3>
                    <p className="rating">
                      ⭐ {hospital.rating || "Rating not listed"}
                    </p>
                  </div>

                  <span className="status">
                    🚑{" "}
                    {hospital.emergency ||
                      "Contact hospital to confirm emergency services"}
                  </span>
                </div>

                <div className="hospital-body">
                  <p>
                    <i className="fa-solid fa-location-dot"></i>{" "}
                    {hospital.address ||
                      [
                        hospital.city,
                        hospital.district,
                        hospital.state,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "Address not listed"}
                  </p>

                  <p>
                    <i className="fa-solid fa-phone"></i>{" "}
                    {hospital.phone || "Phone not listed"}
                  </p>

                  <p>
                    <i className="fa-solid fa-envelope"></i>{" "}
                    {hospital.email || "Email not listed"}
                  </p>
                </div>

                <div className="hospital-footer">
                  {hospital.phone &&
                    hospital.phone !== "Not listed" && (
                      <a
                        href={`tel:${hospital.phone}`}
                        className="call-btn"
                      >
                        Call
                      </a>
                    )}

                  {(hospital.map || hospital.mapUrl) && (
                    <a
                      href={hospital.map || hospital.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-btn"
                    >
                      View Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer tagline="Find trusted hospitals quickly during emergencies." />
    </div>
  );
}
