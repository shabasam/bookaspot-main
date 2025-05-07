"use client"

import Navbar from "../../components/Navbar_vendor"
import BookingCalendar from "./BookingCalendar";
import "./booking.css";

const BookingPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Full-width Navbar at top */}
      <Navbar />
      <div className="booking-container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl text-black font-bold text-center my-6">Manage Your Bookings</h1>
        <p className="text-center text-gray-600 mb-8">
          View and manage all your venue bookings. Click on a date to block/unblock dates or view booking details.
        </p>
        <BookingCalendar />
      </div>
    </div>
  )
}

export default BookingPage
