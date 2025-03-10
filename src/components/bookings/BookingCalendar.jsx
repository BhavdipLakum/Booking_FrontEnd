import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";

const localizer = momentLocalizer(moment);

const calendarStyles = {
  dayPropGetter: (date) => {
    const today = moment().startOf("day").toDate();
    const isToday = moment(date).isSame(today, "day");
    const isisDarkMode = document.documentElement.classList.contains("dark");

    return {
      className: isToday ? (isisDarkMode ? "bg-blue-900" : "bg-blue-50") : "",
      style: {
        border: isisDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        backgroundColor: isisDarkMode ? "#1f2937" : "",
        color: isisDarkMode ? "#f3f4f6" : "",
      },
    };
  },
  eventPropGetter: (event) => {
    let backgroundColor = "#3b82f6";
    const eventType = event.resource?.eventType
      ? event.resource.eventType.toLowerCase()
      : "";

    if (eventType.includes("wedding")) {
      backgroundColor = "#8b5cf6";
    } else if (eventType.includes("corporate")) {
      backgroundColor = "#10b981";
    } else if (eventType.includes("party")) {
      backgroundColor = "#f59e0b";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        padding: "5px",
        border: "0px",
      },
    };
  },
};

const BookingCalendar = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isisDarkMode, setIsisDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkModeEnabled =
      document.documentElement.classList.contains("dark");
    setIsisDarkMode(isDarkModeEnabled);

    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsisDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const url = id
          ? `http://localhost:4000/api/bookings/${id}`
          : `http://localhost:4000/api/bookings`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const calendarEvents = res.data.map((booking) => ({
          id: booking._id,
          title: `${booking.clientName} - ${booking.eventType || "Unknown"}`,
          start: new Date(booking.startDateTime),
          end: new Date(booking.endDateTime),
          resource: booking,
        }));

        setEvents(calendarEvents);
        setError(null);
      } catch (err) {
        setError("Failed to load bookings. Please check your authentication.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const formatDateTime = (dateTimeStr) =>
    moment(dateTimeStr).format("MMM D, YYYY h:mm A");

  return (
    <div
      className={`container mx-auto p-4 mt-20 ${
        isisDarkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-3xl font-extrabold ${
            isisDarkMode ? "text-blue-400" : "text-blue-700"
          }`}
        >
          DJ Booking Calendar
        </h2>
        <button
          onClick={() => (window.location.href = "/new-booking")}
          className={`${
            isisDarkMode
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-lg shadow-md transition duration-300`}
        >
          New Booking
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-52">
          <div
            className={`animate-spin h-12 w-12 border-t-4 ${
              isisDarkMode ? "border-blue-400" : "border-blue-500"
            } border-solid rounded-full`}
          ></div>
        </div>
      ) : error ? (
        <div
          className={`${
            isisDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
          } p-4 rounded-lg`}
        >
          {error}
        </div>
      ) : (
        <div
          className={`${
            isisDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } shadow-lg p-6 rounded-lg border`}
        >
          <div
            style={{ height: "600px" }}
            className={isisDarkMode ? "dark-calendar" : ""}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectEvent={handleSelectEvent}
              views={["month", "week", "day", "agenda"]}
              dayPropGetter={calendarStyles.dayPropGetter}
              eventPropGetter={calendarStyles.eventPropGetter}
              className={`text-sm ${isisDarkMode ? "dark-mode-calendar" : ""}`}
            />
          </div>
        </div>
      )}

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className={`${
              isisDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            } p-6 rounded-lg shadow-2xl w-full max-w-lg relative`}
          >
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-xl font-semibold">
                {selectedEvent.clientName}
              </h5>
              <button
                onClick={closeModal}
                className={`${
                  isisDarkMode
                    ? "text-gray-300 hover:text-gray-100"
                    : "text-gray-600 hover:text-gray-900"
                } text-2xl font-bold`}
              >
                &times;
              </button>
            </div>
            <p>
              <strong>Event Type:</strong> {selectedEvent.eventType || "N/A"}
            </p>
            <p>
              <strong>Date & Time:</strong>{" "}
              {formatDateTime(selectedEvent.startDateTime)} -{" "}
              {formatDateTime(selectedEvent.endDateTime)}
            </p>
            <p>
              <strong>Location:</strong> {selectedEvent.location || "N/A"}
            </p>
            <p>
              <strong>Amount:</strong> ₹
              {selectedEvent.totalAmount
                ? selectedEvent.totalAmount.toFixed(2)
                : "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {selectedEvent.status || "Unknown"}
            </p>
            {selectedEvent.notes && (
              <p>
                <strong>Notes:</strong> {selectedEvent.notes}
              </p>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() =>
                  (window.location.href = `/edit-booking/${selectedEvent._id}`)
                }
                className={`${
                  isisDarkMode
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg shadow-md transition duration-300`}
              >
                Edit Booking
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this booking?"
                    )
                  ) {
                    console.log("Deleting booking:", selectedEvent._id);
                  }
                }}
                className={`${
                  isisDarkMode
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-red-600 hover:bg-red-700"
                } text-white px-4 py-2 rounded-lg shadow-md transition duration-300`}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dark-mode-calendar .rbc-toolbar {
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
        }

        .dark-mode-calendar .rbc-toolbar button {
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
          background-color: ${isisDarkMode ? "#374151" : "inherit"};
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
        }

        .dark-mode-calendar .rbc-toolbar button:hover {
          background-color: ${isisDarkMode ? "#4b5563" : "inherit"};
        }

        .dark-mode-calendar .rbc-toolbar button.rbc-active {
          background-color: ${isisDarkMode ? "#3b82f6" : "inherit"};
          color: white;
        }

        .dark-mode-calendar .rbc-header {
          background-color: ${isisDarkMode ? "#374151" : "inherit"};
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
        }

        .dark-mode-calendar .rbc-month-view,
        .dark-mode-calendar .rbc-time-view {
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
        }

        .dark-mode-calendar .rbc-day-bg {
          background-color: ${isisDarkMode ? "#1f2937" : "inherit"};
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
        }

        .dark-mode-calendar .rbc-off-range-bg {
          background-color: ${isisDarkMode ? "#111827" : "inherit"};
        }

        .dark-mode-calendar .rbc-date-cell {
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
        }

        .dark-mode-calendar .rbc-today {
          background-color: ${isisDarkMode ? "#374151" : "inherit"};
        }

        .dark-mode-calendar .rbc-agenda-view table.rbc-agenda-table {
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
        }

        .dark-mode-calendar
          .rbc-agenda-view
          table.rbc-agenda-table
          thead
          > tr
          > th {
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
          background-color: ${isisDarkMode ? "#374151" : "inherit"};
          color: ${isisDarkMode ? "#f3f4f6" : "inherit"};
        }

        .dark-mode-calendar
          .rbc-agenda-view
          table.rbc-agenda-table
          tbody
          > tr
          > td {
          border-color: ${isisDarkMode ? "#4b5563" : "inherit"};
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;
