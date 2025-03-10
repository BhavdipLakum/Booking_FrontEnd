import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        console.log("Fetching Booking ID:", id);

        const bookingUrl = `http://localhost:4000/api/bookings/${id}`;

        console.log(`Fetching Booking from: ${bookingUrl}`);

        const bookingRes = await axios.get(bookingUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Booking Data:", bookingRes.data);

        if (!bookingRes.data) throw new Error("Booking data is empty!");

        setBooking(bookingRes.data);
        setError(null);
      } catch (err) {
        console.error("API Error:", err?.response?.data || err.message);
        setError(
          err?.response?.data?.message || "Failed to fetch booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id]);

  const updateBookingStatus = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:4000/api/bookings/${id}`, {
        status: newStatus,
      });
      setBooking({ ...booking, status: newStatus });
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status");
    }
  };

  const handleDeleteBooking = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/bookings/${id}`);
      navigate("/bookings");
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  if (!booking)
    return (
      <div className="text-center text-gray-600 p-8">Booking not found</div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto mt-20">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full 
        ${
          booking.status === "Pending"
            ? "bg-yellow-200 text-yellow-800"
            : booking.status === "Confirmed"
            ? "bg-green-200 text-green-800"
            : booking.status === "Cancelled"
            ? "bg-red-200 text-red-800"
            : "bg-gray-200 text-gray-800"
        }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">
            Client Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{booking.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">
                {booking.clientPhone || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">
            Event Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Event Type:</span>
              <span className="font-medium">{booking.eventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start:</span>
              <span className="font-medium">
                {new Date(booking.startDateTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End:</span>
              <span className="font-medium">
                {new Date(booking.endDateTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{booking.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                ₹{booking.totalAmount - booking.depositAmount || "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
