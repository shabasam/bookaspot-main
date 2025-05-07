"use client";


import NavBar from "../../components/NavBar";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BookingCalendar from "./BookingCalendar";
import "./booking.css";

const BookingPage = () => {
  const searchParams = useSearchParams();
  const venueName = searchParams.get("name");

  const { data: session, status } = useSession();
  const userName = session?.user?.name || session?.user?.email || "Guest";

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-black">

      <NavBar />
      </div>
      <div className="h-10"></div>
      <div className="booking-container">
        <h1 className="text-3xl text-black font-bold text-center my-6">
          Book Your Spot
        </h1>

        <p className="text-center text-lg text-gray-700 mb-4">
          Booking for <span className="font-semibold">{venueName}</span>
        </p>
        <p className="text-center text-md text-gray-600 mb-6">
          Customer: <span className="font-semibold">{userName}</span>
        </p>

        <BookingCalendar />
      </div>
    </div>
  );
};

export default BookingPage;