import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./Dashboard.css";

const MENU = [
  { to: "/dashboard", icon: "fa-house", label: "Dashboard" },
  { to: "/profile", icon: "fa-user", label: "My Profile" },
  { to: "/become-donor", icon: "fa-hand-holding-medical", label: "Become Donor" },
  { to: "/find-donor", icon: "fa-magnifying-glass-location", label: "Find Donor" },
  { to: "/emergency", icon: "fa-triangle-exclamation", label: "Emergency Request" },
  { to: "/hospitals", icon: "fa-hospital", label: "Hospitals" },
];

// These numbers are hard-coded placeholders, exactly as in the original dashboard.html.
const CARDS = [
  { icon: "fa-users", title: "Total Donors", value: 250 },
  { icon: "fa-droplet", title: "Blood Groups", value: 8 },
  { icon: "fa-location-dot", title: "Nearby Donors", value: 18 },
  { icon: "fa-heart", title: "Lives Saved", value: 120 },
];

const QUICK_ACTIONS = [
  { label: "Become Donor", to: "/become-donor" },
  { label: "Find Blood", to: "/find-donor" },
  { label: "Emergency Request", to: "/emergency" },
  { label: "Update Profile", to: "/profile" },
];

export default function Dashboard() {
  useDocumentTitle("Dashboard | Blood Donor Finder");

  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    logout();
    alert("Logged out successfully!");
    navigate("/login");
  }

  return (
    <div className="page page-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>🩸 Blood Donor</h2>
        </div>

        <ul>
          {MENU.map((item) => (
            <li key={item.to} className={pathname === item.to ? "active" : ""}>
              <Link to={item.to}>
                <i className={`fa-solid ${item.icon}`}></i>
                {item.label}
              </Link>
            </li>
          ))}

          <li>
            <a href="#" id="logoutBtn" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>{" "}
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main">
        <div className="topbar">
          <h2></h2>

          <div className="user">
            Welcome, <span id="username">{user?.name || "User"}</span>
          </div>
        </div>

        {/* Cards */}
        <div className="cards">
          {CARDS.map((c) => (
            <div className="card" key={c.title}>
              <i className={`fa-solid ${c.icon}`}></i>
              <h3>{c.title}</h3>
              <p>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-grid">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} onClick={() => navigate(a.to)}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
