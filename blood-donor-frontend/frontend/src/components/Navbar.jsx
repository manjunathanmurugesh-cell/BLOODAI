import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";
const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/become-donor", label: "Become Donor" },
  { to: "/find-donor", label: "Find Donor" },
  { to: "/hospitals", label: "Hospitals" },
  { to: "/emergency", label: "Emergency" },
  { to: "/profile", label: "Profile" },
];

// One navbar shared by Home, Become Donor, Find Donor, Hospitals, Emergency
// and Profile (previously the same markup was pasted into six HTML files).
export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    logout();
    alert("Logged out successfully!");
    navigate("/");
  }

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <i className="fa-solid fa-droplet"></i>
          <h2>Blood Donor Finder</h2>
        </div>

        <ul className="nav-links">
          {LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {isLoggedIn ? (
          <a href="#" className="login-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>{" "}
            Logout
          </a>
        ) : (
          <Link to="/login" className="login-btn">
            <i className="fa-solid fa-user"></i>{" "}
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
