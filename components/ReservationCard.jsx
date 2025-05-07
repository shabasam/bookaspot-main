import React from "react";

export default function ReservationCard({ title, count }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-center">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
    </div>
  );
}
