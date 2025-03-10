import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get("bookingId");

  const [formData, setFormData] = useState({
    bookingId: bookingId || "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    status: "completed",
    notes: "",
  });

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token"); // Token ko localStorage se le raha hai
        const res = await axios.get(
          "http://booking-front-end-pearl.vercel.app/api/bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token add kiya header me
            },
          }
        );

        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          console.error("API response is not an array", res.data);
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };

      // When booking is selected, fetch its details and calculate the amount
      if (name === "bookingId") {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found. Redirecting to login...");
          navigate("/login");
          return;
        }

        const fetchBookingDetails = async () => {
          try {
            const res = await axios.get(
              `http://booking-front-end-pearl.vercel.app/api/bookings/${value}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setSelectedBooking(res.data);
            const amount = res.data.totalAmount - res.data.depositAmount;
            setFormData((prevFormData) => ({
              ...prevFormData,
              amount: amount.toFixed(2),
            }));
          } catch (err) {
            console.error("Error fetching booking details:", err);
            alert(
              "Failed to fetch booking details. Please check your token or login again."
            );
          }
        };

        if (value) {
          fetchBookingDetails();
        } else {
          setSelectedBooking(null); // Clear selected booking if no value
        }
      }

      return updatedData;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingId) newErrors.bookingId = "Booking is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.paymentDate)
      newErrors.paymentDate = "Payment date is required";
    if (!formData.paymentMethod)
      newErrors.paymentMethod = "Payment method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://booking-front-end-pearl.vercel.app/api/payments",
        {
          bookingId: formData.bookingId,
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          status: formData.status,
          transactionId: "TRX-" + Date.now(),
          notes: formData.notes,
          paymentDate: formData.paymentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment Successful:", res.data);
      alert("Payment added successfully!");
      navigate("/payments");
    } catch (err) {
      console.error("Error creating payment:", err);
      if (err.response && err.response.data) {
        setErrors({
          ...errors,
          submit: err.response.data.message || "Failed to record payment",
        });
      } else {
        setErrors({ ...errors, submit: "Failed to record payment" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 shadow-lg rounded-lg mt-20">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-100">
        Add Payment
      </h2>

      {errors.submit && (
        <div className="text-red-400 mb-4 text-center">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-section space-y-4">
          <div className="form-group">
            <label
              htmlFor="bookingId"
              className="block text-sm font-medium text-gray-300"
            >
              Select Booking*
            </label>
            <select
              id="bookingId"
              name="bookingId"
              value={formData.bookingId}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 rounded-md bg-gray-700 text-white ${
                errors.bookingId ? "border border-red-500" : "border-gray-600"
              }`}
              disabled={bookingId !== null}
            >
              <option value="">Select a booking</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.clientName ? booking.clientName : "Unknown Client"} -
                  {new Date(booking.startDateTime).toLocaleDateString()} -
                  {booking.eventType}
                </option>
              ))}
            </select>

            {errors.bookingId && (
              <div className="text-red-400 text-sm">{errors.bookingId}</div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300"
            >
              Amount (₹)*
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full p-2 rounded-md bg-gray-700 text-white ${
                errors.amount ? "border border-red-500" : "border-gray-600"
              }`}
            />

            {errors.amount && (
              <div className="text-red-400 text-sm">{errors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-300"
            >
              Payment Method*
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 rounded-md bg-gray-700 text-white ${
                errors.paymentMethod
                  ? "border border-red-500"
                  : "border-gray-600"
              }`}
            >
              <option value="cash">Cash</option>
              <option value="creditCard">Credit Card</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="venmo">Venmo</option>
              <option value="paypal">PayPal</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
            {errors.paymentMethod && (
              <div className="text-red-400 text-sm">{errors.paymentMethod}</div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="paymentDate"
              className="block text-sm font-medium text-gray-300"
            >
              Payment Date*
            </label>
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 rounded-md bg-gray-700 text-white ${
                errors.paymentDate ? "border border-red-500" : "border-gray-600"
              }`}
            />
            {errors.paymentDate && (
              <div className="text-red-400 text-sm">{errors.paymentDate}</div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300"
            >
              Status*
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white border-gray-600"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white border-gray-600"
            ></textarea>
          </div>
        </div>

        <div className="form-actions flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="bg-gray-600 text-gray-200 p-2 rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
          >
            {isSubmitting ? "Processing..." : "Add Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
