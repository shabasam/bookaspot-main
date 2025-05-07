"use client"
import { format } from "date-fns"

const BookingRequestCard = ({ booking, onAccept, onReject }) => {
  const formattedDate = format(new Date(booking.date), "MMMM dd, yyyy")

  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-black mb-4 border-l-4 border-orange-400">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{booking.venueName}</h3>
          <p className="text-gray-600">{formattedDate}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">Customer:</span> {booking.customerName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {booking.customerEmail}
          </p>
          {booking.notes && (
            <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
              <span className="font-medium">Notes:</span> {booking.notes}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAccept(booking._id)}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(booking._id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingRequestCard