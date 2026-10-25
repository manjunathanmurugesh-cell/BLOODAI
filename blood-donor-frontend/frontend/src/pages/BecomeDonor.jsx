import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./BecomeDonor.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STEPS = ["Personal", "Medical", "Address", "Finish"];

const EMPTY_FORM = {
  bloodGroup: "",
  age: "",
  gender: "",
  weight: "",
  lastDonation: "",
  previousDonation: "",
  healthIssue: "",
  state: "",
  district: "",
  city: "",
  pincode: "",
  address: "",
  availability: "",
  confirmed: false,
};

// Returns an error message for the given step, or "" if the step is fine.
// (The original relied on the browser's `required` attributes, which silently
// blocked submit when a required field in a hidden step was empty.)
function validateStep(step, f) {
  if (step === 0) {
    if (!f.bloodGroup) return "Please select your blood group.";
    if (!f.age || f.age < 18 || f.age > 65) return "Age must be between 18 and 65.";
    if (!f.gender) return "Please select gender.";
  }
  if (step === 1) {
    if (!f.weight || f.weight < 45) return "Weight must be at least 45 kg.";
  }
  if (step === 2) {
    if (!f.state.trim() || !f.district.trim() || !f.city.trim())
      return "Please enter state, district and city.";
    if (!f.pincode.trim()) return "Please enter your pincode.";
    if (!f.address.trim()) return "Please enter your full address.";
  }
  if (step === 3) {
    if (!f.availability) return "Please select your availability.";
    if (!f.confirmed) return "Please confirm that the information is correct.";
  }
  return "";
}

export default function BecomeDonor() {
  useDocumentTitle("Become Blood Donor");

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function next() {
    const error = validateStep(step, form);
    if (error) {
      alert(error);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate every step so nothing is skipped
    for (let i = 0; i < STEPS.length; i++) {
      const error = validateStep(i, form);
      if (error) {
        alert(error);
        setStep(i);
        return;
      }
    }

    const donor = {
      mobile: user.mobile,
      bloodGroup: form.bloodGroup,
      age: form.age,
      gender: form.gender,
      weight: form.weight,
      lastDonation: form.lastDonation,
      state: form.state,
      district: form.district,
      city: form.city,
      pincode: form.pincode,
      address: form.address,
      availability: form.availability,
    };

    setSubmitting(true);
    try {
      await api.registerDonor(donor, token);
      alert("🎉 Donor Registered Successfully!");
      navigate("/");
    } catch (err) {
      alert(err.message || "Could not register as a donor.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-become-donor">
      <Navbar />

      <div className="container">
        <div className="card">
          <div className="header">
            <i className="fa-solid fa-droplet"></i>

            <h1>Become a Blood Donor</h1>

            <p>One Donation Can Save Three Lives ❤️</p>
          </div>

          {/* Progress */}
          <div className="progress-bar">
            {STEPS.map((label, i) => (
              <Fragment key={label}>
                {i > 0 && <div className="line"></div>}
                <div className={`step ${i <= step ? "active" : ""}`}>
                  <div className="circle">{i + 1}</div>
                  <p>{label}</p>
                </div>
              </Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* ================= STEP 1 ================= */}
            {step === 0 && (
              <div className="form-step active">
                <h2>
                  <i className="fa-solid fa-user"></i>{" "}
                  Personal Information
                </h2>

                <div className="grid">
                  <div className="input-box">
                    <label>Full Name</label>
                    <input type="text" value={user.name} readOnly />
                  </div>

                  <div className="input-box">
                    <label>Email</label>
                    <input type="email" value={user.email} readOnly />
                  </div>

                  <div className="input-box">
                    <label>Mobile Number</label>
                    <input type="text" value={user.mobile} readOnly />
                  </div>

                  <div className="input-box">
                    <label>Blood Group</label>

                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-box">
                    <label>Age</label>

                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="65"
                      value={form.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label>Gender</label>

                    <div className="radio-group">
                      {["Male", "Female", "Other"].map((g) => (
                        <label key={g}>
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={form.gender === g}
                            onChange={handleChange}
                          />{" "}
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="buttons">
                  <button type="button" className="nextBtn" onClick={next}>
                    Next{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 1 && (
              <div className="form-step active">
                <h2>
                  <i className="fa-solid fa-heart-pulse"></i>{" "}
                  Medical Information
                </h2>

                <div className="grid">
                  <div className="input-box">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      min="45"
                      value={form.weight}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label>Last Blood Donation</label>
                    <input
                      type="date"
                      name="lastDonation"
                      value={form.lastDonation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label>Have you donated blood before?</label>

                    <select
                      name="previousDonation"
                      value={form.previousDonation}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>

                  <div className="input-box">
                    <label>Any Health Issues?</label>

                    <select name="healthIssue" value={form.healthIssue} onChange={handleChange}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                </div>

                <div className="buttons">
                  <button type="button" className="prevBtn" onClick={prev}>
                    <i className="fa-solid fa-arrow-left"></i>{" "}
                    Previous
                  </button>

                  <button type="button" className="nextBtn" onClick={next}>
                    Next{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 2 && (
              <div className="form-step active">
                <h2>
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  Address Information
                </h2>

                <div className="grid">
                  <div className="input-box">
                    <label>State</label>
                    <input type="text" name="state" value={form.state} onChange={handleChange} />
                  </div>

                  <div className="input-box">
                    <label>District</label>
                    <input
                      type="text"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-box">
                    <label>City</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} />
                  </div>

                  <div className="input-box">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={form.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-box">
                  <label>Full Address</label>

                  <textarea
                    name="address"
                    rows={5}
                    placeholder="Enter your complete address"
                    value={form.address}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="buttons">
                  <button type="button" className="prevBtn" onClick={prev}>
                    <i className="fa-solid fa-arrow-left"></i>{" "}
                    Previous
                  </button>

                  <button type="button" className="nextBtn" onClick={next}>
                    Next{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4 ================= */}
            {step === 3 && (
              <div className="form-step active">
                <h2>
                  <i className="fa-solid fa-circle-check"></i>{" "}
                  Review &amp; Submit
                </h2>

                <div className="review-box">
                  <p>
                    <i className="fa-solid fa-circle-check"></i>{" "}
                    Please review your information before submitting.
                  </p>

                  <ul>
                    <li>✔ Personal Information Completed</li>
                    <li>✔ Medical Information Completed</li>
                    <li>✔ Address Information Completed</li>
                  </ul>
                </div>

                <div className="input-box">
                  <label>Availability</label>

                  <select name="availability" value={form.availability} onChange={handleChange}>
                    <option value="">Select Availability</option>
                    <option>Available</option>
                    <option>Not Available</option>
                  </select>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="confirmed"
                      checked={form.confirmed}
                      onChange={handleChange}
                    />{" "}
                    I confirm that the above information is correct and I voluntarily
                    agree to become a blood donor.
                  </label>
                </div>

                <div className="buttons">
                  <button type="button" className="prevBtn" onClick={prev}>
                    <i className="fa-solid fa-arrow-left"></i>{" "}
                    Previous
                  </button>

                  <button type="submit" className="submitBtn" disabled={submitting}>
                    <i className="fa-solid fa-heart"></i>{" "}
                    {submitting ? "Registering..." : "Register as Donor"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
