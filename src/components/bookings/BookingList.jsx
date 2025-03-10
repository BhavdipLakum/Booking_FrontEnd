import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Spinner from "../layout/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrashAlt,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all", // Default status is 'all'
    searchQuery: "", // Default search query is empty
    timeframe: "all", // Default timeframe is 'all'
  });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        // Filter parameters setup
        const params = {};
        if (filters.status && filters.status !== "all")
          params.status = filters.status;
        if (filters.timeframe && filters.timeframe !== "all")
          params.timeframe = filters.timeframe;
        if (filters.searchQuery.trim() !== "")
          params.search = filters.searchQuery;

        console.log("API Call with params:", params); // Debugging

        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/bookings", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", res.data); // Debugging Response

        setBookings(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters]);

  // Handle delete booking
  const handleDelete = async (bookingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
      // alert('Booking deleted successfully.');
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  };

  const toggleDropdown = (event, bookingId) => {
    if (dropdownOpen === bookingId) {
      setDropdownOpen(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownHeight = 100; // Approximate dropdown height

    // Check if dropdown fits below, otherwise open it above
    const isAbove = window.innerHeight - rect.bottom < dropdownHeight;

    setDropdownPosition({
      top: isAbove
        ? rect.top - dropdownHeight + window.scrollY
        : rect.bottom + window.scrollY,
      right: rect.left + window.scrollX,
      isAbove,
    });

    setDropdownOpen(bookingId);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value || "all", // Default to 'all' if value is empty
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search triggered with query:", filters.searchQuery);
  };

  if (loading)
    return (
      <div className="text-center text-gray-500">
        <Spinner />
      </div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold dark:text-white">Bookings</h2>
        <div className="d-flex text-end gap-4">
          <Link
            to="/bookings/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-4"
          >
            <i className="mr-2 fas fa-plus"></i> New Booking
          </Link>
          <Link
            to="/calendar"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-4 sm:mt-0"
          >
            <i className="mr-2 fas fa-calendar"></i> Calendar
          </Link>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        {/* Search input */}
        <form onSubmit={handleSearch} className="w-full sm:w-1/3">
          <input
            type="text"
            name="searchQuery"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Search client or location..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {/* Filter dropdowns */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center w-full sm:w-auto">
            <label
              htmlFor="status"
              className="mr-2 text-gray-900 dark:text-white"
            >
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={(e) => {
                console.log("Selected status:", e.target.value);
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  status: e.target.value,
                }));
              }}
              className="w-full sm:w-auto px-4 py-2 border dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all" className="dark:bg-gray-800 dark:text-white">
                All Statuses
              </option>
              <option
                value="Pending"
                className="dark:bg-gray-800 dark:text-white"
              >
                Pending
              </option>
              <option
                value="Confirmed"
                className="dark:bg-gray-800 dark:text-white"
              >
                Confirmed
              </option>
              <option
                value="Completed"
                className="dark:bg-gray-800 dark:text-white"
              >
                Completed
              </option>
              <option
                value="Cancelled"
                className="dark:bg-gray-800 dark:text-white"
              >
                Cancelled
              </option>
            </select>
          </div>

          {/* Timeframe filter */}
          <div className="flex items-center w-full sm:w-auto">
            <label
              htmlFor="timeframe"
              className="mr-2 text-gray-900 dark:text-white"
            >
              Timeframe:
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all" className="dark:bg-gray-800 dark:text-white">
                All Time
              </option>
              <option
                value="upcoming"
                className="dark:bg-gray-800 dark:text-white"
              >
                Upcoming
              </option>
              <option value="past" className="dark:bg-gray-800 dark:text-white">
                Past
              </option>
              <option
                value="thisMonth"
                className="dark:bg-gray-800 dark:text-white"
              >
                This Month
              </option>
              <option
                value="nextMonth"
                className="dark:bg-gray-800 dark:text-white"
              >
                Next Month
              </option>
            </select>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No bookings found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Client
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Event Type
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Location
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Amount
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-2 border text-center dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const totalAmount = Number(booking.totalAmount) || 0;
                const depositAmount = Number(booking.depositAmount) || 0;
                const pendingAmount = totalAmount - depositAmount;
                let status = "Pending";
                if (totalAmount === 0 || pendingAmount <= 0) {
                  status = "Confirmed";
                }

                return (
                  <tr
                    key={booking._id}
                    className="border-b dark:border-gray-700 dark:bg-gray-900"
                  >
                    <td className="px-4 py-2 text-center dark:text-gray-200">
                      {new Date(booking.startDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center dark:text-gray-200">
                      {booking.clientName}
                    </td>
                    <td className="px-4 py-2 text-center dark:text-gray-200">
                      {booking.eventType}
                    </td>
                    <td className="px-4 py-2 text-center dark:text-gray-200">
                      {booking.location}
                    </td>
                    <td className="px-4 py-2 text-center dark:text-gray-200">
                      ₹{pendingAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          status.toLowerCase() === "pending"
                            ? "bg-yellow-300 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-200"
                            : status.toLowerCase() === "confirmed"
                            ? "bg-blue-300 text-blue-800 dark:bg-blue-600 dark:text-blue-200"
                            : status.toLowerCase() === "completed"
                            ? "bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-200"
                            : status.toLowerCase() === "cancelled"
                            ? "bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-200"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 relative text-center">
                      <button
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
                        onClick={(e) => toggleDropdown(e, booking._id)}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>

                      {dropdownOpen === booking._id && (
                        <div
                          ref={dropdownRef}
                          className="fixed bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50"
                          style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.right,
                            width: "150px",
                          }}
                        >
                          <Link
                            to={`/bookingsdetails/${booking._id}`}
                            className="block text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-2" />{" "}
                            View
                          </Link>
                          <Link
                            to={`/bookings/${booking._id}/edit`}
                            className="block text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />{" "}
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon
                              icon={faTrashAlt}
                              className="mr-2"
                            />{" "}
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingList;
