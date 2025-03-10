import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BookingContext = createContext();

const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/bookings');
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const addBooking = async (newBooking) => {
    try {
      const response = await axios.post('/api/bookings', newBooking);
      setBookings([...bookings, response.data]);
    } catch (err) {
      console.error('Error adding booking:', err);
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axios.delete(`/api/bookings/${id}`);
      setBookings(bookings.filter(booking => booking._id !== id));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, loading, addBooking, deleteBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingProvider;
