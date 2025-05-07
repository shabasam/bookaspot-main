"use client"
import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { format, isToday, getMonth } from "date-fns"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import "./booking.css"

const CustomerBookingCalendar = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const venueName = searchParams.get("name")
  const venueId = searchParams.get("id")

  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Initialize months array
  useEffect(() => {
    const monthsArray = Array.from({ length: 12 }, (_, i) => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + i, 1)
    })
    setMonths(monthsArray)
  }, [])

  // Fetch bookings for this venue
  useEffect(() => {
    if (!venueId || status === "loading") return

    if (status === "unauthenticated") {
      router.push("/UserLogin")
      return
    }

    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        // Calculate date range for the next 12 months
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 12)

        const response = await fetch(
          `/api/bookings?venueId=${venueId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await response.json()
        setBookings(data)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [venueId, status, router])

  const bookDate = async (date) => {
    if (!session) {
      router.push("/UserLogin")
      return
    }

    if (!venueId) {
      setError("Venue information is missing. Please try again.")
      return
    }

    const formatted = format(date, "yyyy-MM-dd")

    // Check if date is already booked
    const isDateBooked = bookings.some((booking) => format(new Date(booking.date), "yyyy-MM-dd") === formatted)

    

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId,
          venueName,
          date: formatted,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book date")
      }

      const newBooking = await response.json()

      // Update local state
      setBookings((prev) => [...prev, newBooking])

      alert(`Booking request sent for ${formatted}`)
      setSelectedMonth(null)
    } catch (err) {
      console.error("Error booking date:", err)
      setError(err.message || "Failed to book date. Please try again.")
    }
  }

  const getStatus = (date) => {
    const formatted = format(date, "yyyy-MM-dd")
    const booking = bookings.find((b) => format(new Date(b.date), "yyyy-MM-dd") === formatted)

    return booking ? booking.status : "free"
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading calendar...</div>
  }

  return (
    <div className="flex flex-col items-center">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <div className="w-full max-w-md mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-2 text-black">Calendar Legend:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2  border-green-400 rounded"></div>
            <span className="text-black">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-red-400 rounded"></div>
            <span className="text-black">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-gray-600 rounded"></div>
            <span className="text-black">Blocked by Vendor</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 bg-yellow-400 rounded"></div>
            <span className="text-black">Requested</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 p-6">
        {months.map((month, index) => (
          <div key={index} className="calendar-container p-4 rounded-lg shadow-lg hover:scale-105 transition-all">
            <div className="flex justify-between mb-2">
              <h2 className="text-black font-semibold">{format(month, "MMMM yyyy")}</h2>
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => setSelectedMonth(month)}>
                Book
              </button>
            </div>

            <Calendar
              defaultActiveStartDate={month}
              tileClassName={({ date }) => {
                const status = getStatus(date)
                let classes = isToday(date) ? "current-day " : ""
                if (status === "accepted" || status === "blocked") classes += "booked-date"
                else if (status === "pending") classes += "pending-date"
                else classes += "free-date"
                return classes.trim()
              }}
              tileDisabled={({ date }) => {
                // Disable past dates
                if (date < new Date()) return true
                // Disable dates not in this month
                return getMonth(date) !== getMonth(month)
              }}
              showNavigation={false}
            />
          </div>
        ))}

        {selectedMonth && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold text-lg">Book Date in {format(selectedMonth, "MMMM yyyy")}</h2>
                <button onClick={() => setSelectedMonth(null)}>Close</button>
              </div>
              <Calendar
                defaultActiveStartDate={selectedMonth}
                onClickDay={bookDate}
                tileDisabled={({ date }) => {
                  // Disable past dates
                  if (date < new Date()) return true
                  // Disable already booked dates
                  const status = getStatus(date)
                  if (status !== "free") return true
                  // Disable dates not in this month
                  return getMonth(date) !== getMonth(selectedMonth)
                }}
                tileClassName={({ date }) => {
                  const status = getStatus(date)
                  if (status === "accepted" || status === "blocked") return "booked-date"
                  if (status === "pending") return "pending-date"
                  return "free-date"
                }}
                showNavigation={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerBookingCalendar
