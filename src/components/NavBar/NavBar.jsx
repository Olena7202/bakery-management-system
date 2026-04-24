import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

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
        <Link
          to="/auth"
          className={`nav-link ${location.pathname === "/auth" ? "nav-link-active" : ""}`}
        >
          Кабінет
        </Link>
        <Link to="/order" className="order-btn">
          Order Online
        </Link>
      </nav>
    </header>
  );
}
