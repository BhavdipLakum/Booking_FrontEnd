import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import Spinner from "../layout/Spinner";

// Move styles outside the component to prevent re-creation on each render
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, backgroundColor: "#f0f4f8" },
  header: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    color: "#fff",
    backgroundColor: "#4A90E2",
    borderRadius: 5,
  },
  subHeader: {
    textAlign: "center",
    fontSize: 10,
    marginBottom: 10,
    color: "#666",
  },
  section: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderLeftWidth: 5,
  },
  label: { fontWeight: "bold", fontSize: 13, color: "#444", marginBottom: 2 },
  value: { fontSize: 12, color: "#333", marginBottom: 5 },
  statusPaid: { color: "green", fontWeight: "bold" },
  statusPending: { color: "red", fontWeight: "bold" },
  statusOther: { color: "orange", fontWeight: "bold" },
  footer: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 20,
    color: "#444",
    fontStyle: "italic",
  },
});

// Constants for filter options
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "creditCard", label: "Credit Card" },
  { value: "bankTransfer", label: "Bank Transfer" },
  { value: "venmo", label: "Venmo" },
  { value: "paypal", label: "PayPal" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

const TIMEFRAME_OPTIONS = [
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "all", label: "All Time" },
];

// API endpoints configuration
const API_CONFIG = {
  baseURL: "http://localhost:4000/api",
  payments: "/payments",
  bookings: "/bookings",
};

// Helper function for status styling
const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
      return styles.statusPaid;
    case "pending":
      return styles.statusPending;
    default:
      return styles.statusOther;
  }
};

// Extract PaymentReceipt as a separate component
const PaymentReceipt = ({ payment, booking }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Payment Receipt</Text>
      <Text style={styles.subHeader}>
        Date: {new Date().toLocaleDateString()}
      </Text>

      <View style={{ ...styles.section, borderLeftColor: "#007BFF" }}>
        <Text style={styles.label}>Client Name</Text>
        <Text style={styles.value}>{booking?.clientName || "N/A"}</Text>
        <Text style={styles.label}>Event</Text>
        <Text style={styles.value}>{booking?.eventType || "N/A"}</Text>
      </View>

      <View style={{ ...styles.section, borderLeftColor: "#28A745" }}>
        <Text style={styles.label}>Payment ID</Text>
        <Text style={styles.value}>{payment._id}</Text>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>₹{payment.amount.toFixed(2)}</Text>
        <Text style={styles.label}>Method</Text>
        <Text style={styles.value}>{payment.paymentMethod}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={{ ...styles.value, ...getStatusStyle(payment.status) }}>
          {payment.status}
        </Text>
      </View>

      <View style={{ ...styles.section, borderLeftColor: "#FFC107" }}>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{payment.notes || "N/A"}</Text>
      </View>

      <Text style={styles.footer}>Thank you for your payment!</Text>
    </Page>
  </Document>
);

// Empty state component
const EmptyState = ({ message, actionText, actionLink, icon }) => (
  <div className="empty-state text-center p-8 my-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
    {icon && (
      <div className="icon-container mb-4 flex justify-center">{icon}</div>
    )}
    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
      {message}
    </h3>
    {actionText && actionLink && (
      <Link
        to={actionLink}
        className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        {actionText}
      </Link>
    )}
  </div>
);

// Extract filter component for better organization
const PaymentFilters = ({ filters, handleFilterChange, handleSearch }) => (
  <div className="filters-bar mb-6">
    <form
      onSubmit={handleSearch}
      className="search-form flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4"
    >
      <input
        type="text"
        name="searchQuery"
        value={filters.searchQuery}
        onChange={handleFilterChange}
        placeholder="Search client name..."
        className="search-input px-4 py-2 border rounded-md w-full sm:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-2 gap-1 rounded-md flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          width="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-white"
        >
          <path d="M21 21l-4.35-4.35M17.5 10.5a7.5 7.5 0 1 0-15 0 7.5 7.5 0 0 0 15 0z"></path>
        </svg>
        Search
      </button>
    </form>

    <div className="filter-options flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
      <FilterSelect
        id="status"
        label="Status:"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={handleFilterChange}
      />

      <FilterSelect
        id="paymentMethod"
        label="Method:"
        options={PAYMENT_METHOD_OPTIONS}
        value={filters.paymentMethod}
        onChange={handleFilterChange}
      />

      <FilterSelect
        id="timeframe"
        label="Timeframe:"
        options={TIMEFRAME_OPTIONS}
        value={filters.timeframe}
        onChange={handleFilterChange}
      />
    </div>
  </div>
);

// Reusable filter select component
const FilterSelect = ({ id, label, options, value, onChange }) => (
  <div className="filter-group">
    <label htmlFor={id} className="block font-medium">
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="filter-select p-2 border rounded-md w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Custom API request function with error handling
const fetchData = async (endpoint, token) => {
  try {
    const response = await axios.get(`${API_CONFIG.baseURL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);

    // Handle 404 errors specifically (likely no data found)
    if (error.response && error.response.status === 404) {
      return { data: [], error: null };
    }

    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    return { data: [], error: errorMessage };
  }
};

// Main component
const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    searchQuery: "",
    timeframe: "thisMonth",
    paymentMethod: "all",
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? savedMode === "true" : false;
  });

  // Handle dark mode
  useEffect(() => {
    const applyDarkMode = () => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", isDarkMode);
    };

    applyDarkMode();
  }, [isDarkMode]);

  // Set up listener for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      if (localStorage.getItem("darkMode") === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Fetch payments and bookings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Use the custom fetch function that handles errors more gracefully
        const [paymentsResult, bookingsResult] = await Promise.all([
          fetchData(API_CONFIG.payments, token),
          fetchData(API_CONFIG.bookings, token),
        ]);

        // Check for errors in either request
        if (paymentsResult.error && bookingsResult.error) {
          setError("Failed to fetch data. Please try again later.");
        } else if (paymentsResult.error) {
          setError(
            "Failed to fetch payments. Booking data was loaded successfully."
          );
        } else if (bookingsResult.error) {
          setError(
            "Failed to fetch bookings. Payment data was loaded successfully."
          );
        } else {
          setError(null);
        }

        // Always set the data we have, even if one request failed
        setPayments(
          Array.isArray(paymentsResult.data) ? paymentsResult.data : []
        );
        setBookings(
          Array.isArray(bookingsResult.data) ? bookingsResult.data : []
        );
        setDataInitialized(true);
      } catch (err) {
        console.error("Error in data loading:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getBookingDetails = (bookingId) => {
    return bookings.find((booking) => booking._id === bookingId) || {};
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Currently just prevents form submission, but could be extended
  };

  // Filter payments based on selected filters
  const filteredPayments = () => {
    return payments.filter((payment) => {
      // Get booking for current payment to access client name
      const booking = getBookingDetails(payment.bookingId);

      // Filter by status
      if (filters.status !== "all" && payment.status !== filters.status) {
        return false;
      }

      // Filter by payment method
      if (
        filters.paymentMethod !== "all" &&
        payment.paymentMethod !== filters.paymentMethod
      ) {
        return false;
      }

      // Filter by search query (client name)
      if (filters.searchQuery) {
        const clientName = booking.clientName || "";
        if (
          !clientName.toLowerCase().includes(filters.searchQuery.toLowerCase())
        ) {
          return false;
        }
      }

      // Filter by timeframe (date range)
      if (filters.timeframe !== "all") {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        let startDate;

        switch (filters.timeframe) {
          case "thisMonth":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "lastMonth":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            break;
          case "thisYear":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "lastYear":
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            break;
          default:
            startDate = new Date(0); // all time
        }

        if (paymentDate < startDate) return false;
      }

      return true;
    });
  };

  // Calculate total amount from filtered payments
  const getTotalAmount = () => {
    return filteredPayments().reduce((total, payment) => {
      return payment.status === "completed" ? total + payment.amount : total;
    }, 0);
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="loading text-center p-4 dark:bg-gray-900 dark:text-white">
        <Spinner />
      </div>
    );
  }

  // Get filtered payments once for use in multiple places
  const filteredPaymentsList = filteredPayments();
  const hasPayments = payments.length > 0;
  const hasFilteredPayments = filteredPaymentsList.length > 0;

  return (
    <div className="payment-list p-6 rounded-lg shadow-lg mt-20 dark:bg-gray-800 dark:text-white">
      <div className="header-actions flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold">Payments</h2>
          {hasPayments && (
            <div className="total-summary mt-2 text-lg">
              Total:{" "}
              <strong className="text-green-500">
                ₹{getTotalAmount().toFixed(2)}
              </strong>
            </div>
          )}
        </div>
        <Link
          to="/payments/new"
          className="new-payment-btn bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md flex items-center"
        >
          <i className="icon-plus mr-2"></i> Add Payment
        </Link>
      </div>

      {/* Show error notification if there's an error */}
      {error && (
        <div className="error-notification bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Show filters only if we have data or we've tried to load data */}
      {dataInitialized && hasPayments && (
        <PaymentFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleSearch={handleSearch}
        />
      )}

      {/* Handle different data states */}
      {dataInitialized && !hasPayments ? (
        <EmptyState
          message="No payment records found. Start by adding your first payment."
          actionText="Add Payment"
          actionLink="/payments/new"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      ) : dataInitialized && hasPayments && !hasFilteredPayments ? (
        <EmptyState
          message="No payments match your current filters."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          }
        />
      ) : dataInitialized && hasPayments && hasFilteredPayments ? (
        <div className="payments-table-container overflow-x-auto">
          <table className="payments-table w-full border-collapse table-auto dark:text-gray-200">
            <thead>
              <tr className="dark:border-gray-700">
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Date
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Client
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Event
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Amount
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Method
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Status
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Notes
                </th>
                <th className="py-2 px-4 border-b dark:border-gray-700">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPaymentsList.map((payment) => {
                const booking = getBookingDetails(payment.bookingId);
                return (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {booking.clientName || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {booking.eventType || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {payment.paymentMethod}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      <span
                        className={`status-badge px-3 py-1 rounded-full text-white ${
                          payment.status === "completed"
                            ? "bg-green-500"
                            : payment.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {payment.notes || "—"}
                    </td>
                    <td className="py-2 px-4 border-b dark:border-gray-700">
                      {payment.status === "completed" && (
                        <PDFDownloadLink
                          document={
                            <PaymentReceipt
                              payment={payment}
                              booking={booking}
                            />
                          }
                          fileName={`payment_receipt_${payment._id}.pdf`}
                        >
                          {({ loading: pdfLoading }) => (
                            <button
                              className="flex items-center justify-center"
                              title="Download Receipt"
                            >
                              {pdfLoading ? (
                                "Loading PDF..."
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="30"
                                  height="30"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    fill="#D32F2F"
                                    d="M4 2h12l6 6v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                                  />
                                  <text
                                    x="5.5"
                                    y="19"
                                    fontSize="8"
                                    fontWeight="bold"
                                    fill="white"
                                  >
                                    PDF
                                  </text>
                                </svg>
                              )}
                            </button>
                          )}
                        </PDFDownloadLink>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentList;
