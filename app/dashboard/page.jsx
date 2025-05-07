"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { format, isToday, getMonth } from "date-fns"
import ReservationCard from "../../components/ReservationCard"
import Navbar from "../../components/Navbar_vendor"
import BookingRequestCard from "../../components/BookingRequestCard"
import "../booking/booking.css" // Import the calendar styles

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingStats, setBookingStats] = useState({
    today: 0,
    pending: 0,
    monthly: 0,
    upcoming: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Calendar state
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [bookings, setBookings] = useState([])
  const [venueId, setVenueId] = useState("")
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [dateToBlock, setDateToBlock] = useState(null)
  const [blockNote, setBlockNote] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)

  

  // Initialize months array
  useEffect(() => {
    const monthsArray = Array.from({ length: 12 }, (_, i) => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + i, 1)
    })
    setMonths(monthsArray)
  }, [])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated" || (session && session.user.role !== "vendor")) {
      router.push("/loginform")
      return
    }

    const fetchVenue = async () => {
      try {
        const response = await fetch("/api/userinfo")

        if (!response.ok) {
          throw new Error("Failed to fetch venue")
        }

        const data = await response.json()

        // Set the first venue ID
        if (data.length > 0) {
          setVenueId(data[0]._id)
        }
      } catch (err) {
        console.error("Error fetching venue:", err)
        setError("Failed to load venue. Please try again.")
      }
    }

    fetchVenue()
  }, [status, router, session])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated" || (session && session.user.role !== "vendor")) {
      router.push("/loginform")
      return
    }
  
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        // Get today's date and format it
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        // Fetch all bookings
        const response = await fetch(`/api/bookings`)

        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const allBookings = await response.json()
        setBookings(allBookings)

        // Filter pending bookings
        const pending = allBookings.filter((b) => b.status === "pending")
        setPendingBookings(pending)

        // Calculate stats
        const todayBookings = allBookings.filter((b) => {
          const bookingDate = new Date(b.date)
          return bookingDate.toDateString() === today.toDateString() && b.status === "accepted"
        })

        const monthlyBookings = allBookings.filter((b) => {
          const bookingDate = new Date(b.date)
          return bookingDate >= startOfMonth && bookingDate <= endOfMonth && b.status === "accepted"
        })

        const upcomingBookings = allBookings.filter((b) => {
          const bookingDate = new Date(b.date)
          return bookingDate > today && b.status === "accepted"
        })

        setBookingStats({
          today: todayBookings.length,
          pending: pending.length,
          monthly: monthlyBookings.length,
          upcoming: upcomingBookings.length,
        })
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [status, router, session])

  const handleAcceptBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept booking")
      }

      // Update UI
      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId))
      setBookingStats((prev) => ({
        ...prev,
        pending: prev.pending ,
        upcoming: prev.upcoming,
      }))

      // Update bookings list
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: "accepted" } : b)))

      alert("Booking accepted successfully")
    } catch (err) {
      console.error("Error accepting booking:", err)
      setError("Failed to accept booking. Please try again.")
    }
  }

  const handleRejectBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject booking")
      }

      // Update UI
      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId))
      setBookingStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
      }))

      // Update bookings list
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: "rejected" } : b)))

      alert("Booking rejected successfully")
    } catch (err) {
      console.error("Error rejecting booking:", err)
      setError("Failed to reject booking. Please try again.")
    }
  }

  const blockDate = async () => {
    if (!dateToBlock || !venueId) return

    try {
      const formatted = format(dateToBlock, "yyyy-MM-dd")

      const response = await fetch("/api/bookings/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId,
          date: formatted,
          notes: blockNote || "Blocked by venue owner",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to block date")
      }

      const newBlocked = await response.json()

      // Update local state
      setBookings((prev) => [...prev, newBlocked])

      alert(`Date ${formatted} has been blocked`)
      setShowBlockModal(false)
      setDateToBlock(null)
      setBlockNote("")
    } catch (err) {
      console.error("Error blocking date:", err)
      setError(err.message || "Failed to block date. Please try again.")
    }
  }

  const getBookingForDate = (date) => {
    const formatted = format(date, "yyyy-MM-dd")
    return bookings.find((b) => format(new Date(b.date), "yyyy-MM-dd") === formatted)
  }

  const getStatus = (date) => {
    const booking = getBookingForDate(date)
    return booking ? booking.status : "free"
  }

  const handleDateClick = (date) => {
    const booking = getBookingForDate(date)

    if (booking) {
      if (booking.status === "blocked" && window.confirm(`Unblock date ${format(date, "yyyy-MM-dd")}?`)) {
        // Delete the blocked date
        fetch(`/api/bookings/${booking._id}`, { method: "DELETE" })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to unblock date")
            return response.json()
          })
          .then(() => {
            setBookings((prev) => prev.filter((b) => b._id !== booking._id))
            alert(`Date ${format(date, "yyyy-MM-dd")} has been unblocked`)
          })
          .catch((err) => {
            console.error("Error unblocking date:", err)
            setError("Failed to unblock date. Please try again.")
          })
      } else {
        // Just show booking info for other statuses
        alert(
          `This date is ${booking.status}.\nCustomer: ${booking.customerName || "N/A"}\nNotes: ${booking.notes || "None"}`,
        )
      }
    } else {
      // If date is free, show block modal
      setDateToBlock(date)
      setShowBlockModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto mt-10 px-4">
          <p className="text-center">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <h1 className="text-3xl text-black font-bold">Welcome to BOOKaSPOT!</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">{error}</div>}

        <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReservationCard title="Today's Bookings" count={bookingStats.today} />
          <ReservationCard title="Pending Requests" count={bookingStats.pending} />
          <ReservationCard title="Monthly Bookings" count={bookingStats.monthly} />
          <ReservationCard title="Upcoming" count={bookingStats.upcoming} />
        </section>

        {pendingBookings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl text-black font-semibold mb-4">Pending Booking Requests</h2>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <BookingRequestCard
                  key={booking._id}
                  booking={booking}
                  onAccept={handleAcceptBooking}
                  onReject={handleRejectBooking}
                />
              ))}
            </div>
          </section>
        )}

        {/* Calendar Section */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>
          </div>

          {showCalendar && (
            <div className="mt-4">
              {/* Calendar Legend */}
              <div className="w-full mb-6 text-black p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold text-black mb-2">Calendar Legend:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-green-400 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-red-400 rounded"></div>
                    <span>Booked/Unavailable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-gray-600 rounded"></div>
                    <span>Blocked by You</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-yellow-400 rounded"></div>
                    <span>Requested by Customer</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-red-200 rounded"></div>
                    <span>Rejected by Customer</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {months.map((month, index) => (
                  <div
                    key={index}
                    className="calendar-container p-4 rounded-lg shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex justify-between mb-2">
                      <h2 className="text-black font-semibold">{format(month, "MMMM yyyy")}</h2>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => setSelectedMonth(month)}
                      >
                        Manage
                      </button>
                    </div>

                    <Calendar
                      defaultActiveStartDate={month}
                      tileClassName={({ date }) => {
                        let classes = isToday(date) ? "current-day " : ""
                        const status = getStatus(date)
                        if (status === "accepted") classes += "booked-date"
                        else if (status === "pending") classes += "pending-date"
                        else if (status === "blocked") classes += "blocked-date"
                        else if (status === "cancelled") classes += "cancelled-date"
                        else if (status === "rejected") classes += "rejected-date"
                        else classes += "free-date"
                        return classes.trim()
                      }}
                      tileDisabled={({ date }) => getMonth(date) !== getMonth(month)}
                      showNavigation={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month Detail Modal */}
          {selectedMonth && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                <div className="flex justify-between mb-4">
                  <h2 className="font-semibold text-lg">Manage {format(selectedMonth, "MMMM yyyy")}</h2>
                  <button onClick={() => setSelectedMonth(null)}>Close</button>
                </div>
                <Calendar
                  defaultActiveStartDate={selectedMonth}
                  onClickDay={handleDateClick}
                  tileClassName={({ date }) => {
                    const status = getStatus(date)
                    if (status === "accepted") return "booked-date"
                    if (status === "pending") return "pending-date"
                    if (status === "blocked") return "blocked-date"
                    if (status === "cancelled") return "cancelled-date"
                    if (status === "rejected") return "rejected-date"
                    return "free-date"
                  }}
                  tileDisabled={({ date }) => {
                    // Only disable dates not in this month
                    return getMonth(date) !== getMonth(selectedMonth)
                  }}
                  showNavigation={false}
                />
                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-green-400 rounded-full mr-1"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center ml-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center ml-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center ml-2">
                      <div className="w-3 h-3 bg-gray-600 rounded-full mr-1"></div>
                      <span>Blocked</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Click on a date to block/unblock or view booking details</p>
                </div>
              </div>
            </div>
          )}

          {/* Block Date Modal */}
          {showBlockModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                <div className="flex justify-between mb-4">
                  <h2 className="font-semibold text-lg">
                    Block Date: {dateToBlock ? format(dateToBlock, "MMMM dd, yyyy") : ""}
                  </h2>
                  <button
                    onClick={() => {
                      setShowBlockModal(false)
                      setDateToBlock(null)
                      setBlockNote("")
                    }}
                  >
                    Close
                  </button>
                </div>

                <div className="mb-4">
                  <label htmlFor="block-note" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <textarea
                    id="block-note"
                    value={blockNote}
                    onChange={(e) => setBlockNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter reason for blocking this date"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowBlockModal(false)
                      setDateToBlock(null)
                      setBlockNote("")
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button onClick={blockDate} className="px-4 py-2 bg-red-600 text-white rounded-md">
                    Block Date
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="h-10"></div>
      </div>
    </div>
  )
}
