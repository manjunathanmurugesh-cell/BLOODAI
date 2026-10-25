
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Login.css";

export default function Login() {
  useDocumentTitle("Login | Blood Donor Finder");

  const { isLoggedIn, login } = useAuth();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in.
  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // STEP 1: Validate email/password and request OTP.
  async function handleLogin(e) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      const data = await api.login(
        email.trim().toLowerCase(),
        password
      );

      if (!data.requiresOtp) {
        throw new Error(
          "OTP login is not enabled on the backend. Check authRoutes.js."
        );
      }

      setOtp("");
      setOtpStep(true);

      alert(data.message || "OTP sent to your registered email.");
    } catch (err) {
      alert(err.message || "Unable to send OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  // STEP 2: Verify OTP and log in only after verification.
  async function handleVerifyOtp(e) {
    e.preventDefault();

    if (submitting) return;

    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await api.verifyLoginOtp(
        email.trim().toLowerCase(),
        otp
      );

      if (!data.token || !data.user) {
        throw new Error(
          "Login response is incomplete. Please check the backend."
        );
      }

      // Save authentication only after successful OTP verification.
      login(data.token, data.user);

      alert("Login successful!");
    } catch (err) {
      alert(err.message || "OTP verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function backToLogin() {
    setOtp("");
    setOtpStep(false);
  }

  return (
    <div className="page page-login">
      <div className="container">
        {/* Left Panel */}
        <div className="left-panel">
          <h1>Welcome Back!</h1>

          <p>
            Login to access the Blood Donor Finder system and
            help save lives.
          </p>

          <img
            src="/images/blood-donation.png"
            alt="Blood Donation"
          />
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="login-box">
            {!otpStep ? (
              <>
                <h2>Login</h2>

                <p>Enter your credentials</p>

                <form onSubmit={handleLogin}>
                  {/* Email */}
                  <div className="input-box">
                    <i className="fa-solid fa-envelope"></i>

                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="input-box">
                    <i className="fa-solid fa-lock"></i>

                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {/* Remember Me / Forgot Password */}
                  <div className="options">
                    <label>
                      <input type="checkbox" /> Remember Me
                    </label>

                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting}
                  >
                    {submitting ? "Sending OTP..." : "Login"}
                  </button>
                </form>

                <div className="register-link">
                  Don't have an account?{" "}
                  <Link to="/register">Register</Link>
                </div>
              </>
            ) : (
              <>
                {/* OTP Verification Screen */}
                <h2>Verify OTP</h2>

                <p>
                  Enter the 6-digit verification code sent to
                  your email.
                </p>

                <p>
                  <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerifyOtp}>
                  <div className="input-box">
                    <i className="fa-solid fa-key"></i>

                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      aria-label="6-digit email OTP"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting || otp.length !== 6}
                  >
                    {submitting
                      ? "Verifying..."
                      : "Verify & Login"}
                  </button>
                </form>

                <div className="register-link">
                  <button
                    type="button"
                    className="btn"
                    onClick={backToLogin}
                    disabled={submitting}
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
