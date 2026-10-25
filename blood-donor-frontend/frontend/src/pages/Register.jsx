
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../services/api.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Register.css";

const EMPTY_FORM = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  useDocumentTitle("Register | Blood Donor Finder");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const referralCode = (
    searchParams.get("ref") ||
    ""
  ).trim().toUpperCase();

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const mobile = form.mobile.trim();
    const { password, confirmPassword } = form;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await api.register({
        name,
        email,
        mobile,
        password,
        ...(referralCode ? { referralCode } : {}),
      });

      alert(
        referralCode
          ? "Account created successfully! Log in to continue your donor registration."
          : "Registration successful! Please log in."
      );

      // Keep the referral code in the URL so it remains available
      // during the next step. The backend must validate and record it.
      if (referralCode) {
        navigate(`/login?ref=${encodeURIComponent(referralCode)}`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      alert(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-register">
      <div className="container">
        <div className="left-panel">
          <h1>Blood Donor Finder</h1>

          <p>
            Register today and become a lifesaver. Your donation can give
            someone a second chance at life.
          </p>

          <img
            src="/images/blood-donation.png"
            alt="Blood Donation"
          />
        </div>

        <div className="right-panel">
          <div className="register-box">
            <h2>Create Account</h2>
            <p>Please fill in your details</p>

            {referralCode && (
              <div
                style={{
                  background: "#fff1f1",
                  border: "1px solid #f2b8b8",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <i className="fa-solid fa-heart"></i>{" "}
                You were invited to join Blood Donor Finder.
                <div style={{ marginTop: 6 }}>
                  Referral code: <strong>{referralCode}</strong>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="input-box">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="input-box">
                <i className="fa-solid fa-phone"></i>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  maxLength={10}
                  value={form.mobile}
                  onChange={handleChange}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="login-link">
              Already have an account?{" "}
              <Link
                to={
                  referralCode
                    ? `/login?ref=${encodeURIComponent(referralCode)}`
                    : "/login"
                }
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
