import React from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaCalendarCheck, FaCreditCard, FaMoneyBill, FaChartBar, FaCog } from "react-icons/fa";

const Sidebar = ({ closeSidebar }) => {
  return (
    <div className="sidebar-overlay d-lg-none" onClick={closeSidebar}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={(e) => {
          e.stopPropagation();
          closeSidebar();
        }}>
          <FaTimes />
        </button>

        <div className="profile-section">
          <img src="/profile-placeholder.jpg" alt="Profile" />
          <h3>DJ Name</h3>
        </div>

        <ul className="menu-items">
          <li><Link to="/bookings" onClick={closeSidebar}><FaCalendarCheck className="me-2" /> Bookings</Link></li>
          <li><Link to="/payments" onClick={closeSidebar}><FaCreditCard className="me-2" /> Payments</Link></li>
          <li><Link to="/expenses" onClick={closeSidebar}><FaMoneyBill className="me-2" /> Expenses</Link></li>
          <li><Link to="/reports" onClick={closeSidebar}><FaChartBar className="me-2" /> Reports</Link></li>
          <li><Link to="/settings" onClick={closeSidebar}><FaCog className="me-2" /> Settings</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
