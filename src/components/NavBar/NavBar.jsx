import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, getDashboardPathByRole, logout } from "../../services/authStorage";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const accountPath = currentUser ? getDashboardPathByRole(currentUser.role) : "/auth";

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Bafylo
      </Link>

      <nav className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "nav-link-active" : ""}`}
        >
          Menu
        </Link>
        <Link to="/order" className="order-btn">
          Order Online
        </Link>
        <Link
          to={accountPath}
          className={`account-btn ${location.pathname.startsWith("/client") || location.pathname.startsWith("/confectioner") || location.pathname === "/auth" ? "nav-link-active" : ""}`}
          aria-label="Account"
        >
          <svg className="account-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
        {currentUser && (
          <button type="button" className="account-logout-btn" onClick={handleLogout}>
            Вийти
          </button>
        )}
      </nav>
    </header>
  );
}
