import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBars, FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const localData = localStorage.getItem("token");
  const userData = localStorage.getItem("User Name") || "Profile";

  const changeHandler = () => {
    localStorage.clear();
    toast.success("Logout Successfully");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg px-3 shadow-sm fixed-top" style={navStyle}>
        <div className="container-fluid d-flex align-items-center justify-content-between">

          {isMobile && (
            <button className="btn text-white" onClick={() => setIsSidebarOpen(true)}>
              <FaBars className="fs-4" />
            </button>
          )}

          {/* Brand Name */}
          <Link className="navbar-brand fw-bold text-white fs-5 mx-auto" to="/">
            🎵 DJ Booking
          </Link>

          {!isMobile && (
            <div className="container-fluid d-flex justify-content-center mt-2">
              <ul className="navbar-nav d-flex flex-row gap-3">
                {navLinks.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link className="nav-link text-white" to={item.path} style={navLinkStyle}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Right Side Controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="btn btn-outline-light rounded-circle p-2">
              {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>

            {localData ? (
              <div className="dropdown relative" ref={dropdownRef}>
                <button
                  className=" px-3 py-2 rounded"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUserCircle className="me-2" size={40} />
                </button>
                {dropdownOpen && (
                  <ul className="dropdown-menu dropdown-menu-start show right-6">
                    <li><Link className="dropdown-item" to="/profile" onClick={() => setDropdownOpen(false)}>{userData}</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center" onClick={() => {
                        setDropdownOpen(false);
                        changeHandler();
                      }}>
                        <FaSignOutAlt className="me-2" size={18} /> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link className="btn btn-outline-light" to="/login">Login</Link>
            )}
          </div>
        </div>

      </nav>

      {/* Sidebar for Mobile */}
      {isSidebarOpen && <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />}
    </>
  );
};

const navStyle = {
  background: "#1e3363",
  backdropFilter: "blur(10px)",
  borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
  padding: "12px 20px",
};

const navLinkStyle = {
  color: "white",
  transition: "all 0.3s ease-in-out",
  textDecoration: "none",
};

const navLinks = [
  { label: "Bookings", path: "/bookings" },
  { label: "Payments", path: "/payments" },
  { label: "Expenses", path: "/expenses" },
  { label: "Reports", path: "/reports" },
];

export default Navbar;