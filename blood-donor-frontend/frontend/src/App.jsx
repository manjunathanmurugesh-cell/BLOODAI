
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BecomeDonor from "./pages/BecomeDonor.jsx";
import FindDonor from "./pages/FindDonor.jsx";
import Hospitals from "./pages/Hospitals.jsx";
import Emergency from "./pages/Emergency.jsx";
import Profile from "./pages/Profile.jsx";
import Referral from "./pages/Referral.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Find Donor */}
        <Route
          path="/find-donor"
          element={
            <ProtectedRoute>
              <FindDonor />
            </ProtectedRoute>
          }
        />

        {/* Hospital Directory */}
        <Route
          path="/hospitals"
          element={
            <ProtectedRoute>
              <Hospitals />
            </ProtectedRoute>
          }
        />

        {/* Emergency */}
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />

        {/* Become a Donor */}
        <Route
          path="/become-donor"
          element={
            <ProtectedRoute>
              <BecomeDonor />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Referral Dashboard */}
        <Route
          path="/referral"
          element={
            <ProtectedRoute>
              <Referral />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
