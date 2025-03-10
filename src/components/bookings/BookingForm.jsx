import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext"; // Adjust the import path as needed

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext); // Access theme context
  const isDarkMode = theme === "dark";

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    eventType: "wedding",
    startDateTime: "",
    endDateTime: "",
    location: "",
    totalAmount: "",
    depositAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:4000/api/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData(res.data);
    } catch (err) {
      console.error("Error fetching booking details:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName) newErrors.clientName = "Client name is required";
    if (!formData.clientPhone) newErrors.clientPhone = "Phone is required";
    if (!formData.startDateTime)
      newErrors.startDateTime = "Start date/time is required";
    if (!formData.endDateTime)
      newErrors.endDateTime = "End date/time is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.totalAmount)
      newErrors.totalAmount = "Total amount is required";

    // Check if end time is after start time
    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      if (end <= start) {
        newErrors.endDateTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before submitting
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Calculate pendingAmount and status based on formData (without changing formData)
      const totalAmount = Number(formData.totalAmount) || 0;
      const depositAmount = Number(formData.depositAmount) || 0;
      const pendingAmount = totalAmount - depositAmount;

      // Determine status based on the calculated pendingAmount
      let status = "Pending"; // Default status
      if (totalAmount === 0 || pendingAmount <= 0) {
        status = "Confirmed";
      }

      if (id && id !== "new") {
        await axios.put(
          `http://localhost:4000/api/bookings/${id}`,
          {
            ...formData,
            pendingAmount,
            status,
          },
          config
        );
      } else {
        const res = await axios.post(
          `http://localhost:4000/api/bookings`,
          {
            ...formData,
            pendingAmount,
            status,
          },
          config
        );

        navigate(`/bookings/${res.data._id}`);
      }

      navigate("/bookings");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setErrors({
        submit: err.response?.data?.message || "Failed to process request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if ThemeContext is working
  console.log("Current theme:", theme);

  return (
    <div
      className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
      style={{ marginTop: "80px" }}
    >
      <h2
        className={`text-2xl font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        {id && id !== "new" ? "Update Booking" : "Create New Booking"}
      </h2>

      {errors.submit && (
        <div
          className={`p-4 rounded mb-4 ${
            isDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
          }`}
        >
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Client Information
          </h3>

          <div className="flex flex-col">
            <label
              htmlFor="clientName"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Client Name*
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                errors.clientName
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.clientName && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.clientName}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="clientPhone"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Phone*
            </label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                errors.clientPhone
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.clientPhone && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.clientPhone}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Event Details
          </h3>

          <div className="flex flex-col">
            <label
              htmlFor="eventType"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Event Type*
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate Event</option>
              <option value="birthday">Birthday Party</option>
              <option value="nightclub">Nightclub</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="startDateTime"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Start Date/Time*
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                errors.startDateTime
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.startDateTime && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.startDateTime}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="endDateTime"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              End Date/Time*
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                errors.endDateTime
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.endDateTime && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.endDateTime}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="location"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Location*
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`mt-2 p-2 border rounded-md ${
                errors.location
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.location && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.location}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Payment Information
          </h3>

          <div className="flex flex-col">
            <label
              htmlFor="totalAmount"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Total Amount (₹)*
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-2 p-2 border rounded-md ${
                errors.totalAmount
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              }`}
            />
            {errors.totalAmount && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {errors.totalAmount}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="depositAmount"
              className={isDarkMode ? "text-gray-300" : "text-gray-700"}
            >
              Deposit Amount (₹)
            </label>
            <input
              type="number"
              id="depositAmount"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-2 p-2 border rounded-md ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className={`px-6 py-2 rounded ${
              isDarkMode
                ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded ${
              isDarkMode ? "hover:bg-blue-500" : "hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isSubmitting
              ? "Saving..."
              : id && id !== "new"
              ? "Update Booking"
              : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
