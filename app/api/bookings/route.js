import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectMongoDB } from "../../../lib/mongodb"
import Booking from "../../../models/booking"
import UserInfo from "../../../models/UserInfo"
import { authOptions } from "../auth/[...nextauth]/route"

// GET all bookings for a venue or customer
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get("venueId")
    const customerId = searchParams.get("customerId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    await connectMongoDB()

    const query = {}

    // Filter by venue if provided
    if (venueId) {
      query.venueId = venueId
    }

    // Filter by customer if provided
    if (customerId) {
      query.customerId = customerId
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // If user is a vendor, only show their venues' bookings
    if (session.user.role === "vendor") {
      // Get all venues owned by this vendor
      const venues = await UserInfo.find({ userId: session.user._id })
      const venueIds = venues.map((venue) => venue._id)

      // Add venue filter to query
      query.venueId = { $in: venueIds }
    }
    // If user is a customer, only show their bookings
    else if (session.user.role === "customer") {
      query.customerId = session.user._id
    }

    const bookings = await Booking.find(query).sort({ date: 1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create a new booking
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { venueId, venueName, date, notes } = await request.json()

    if (!venueId || !venueName || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectMongoDB()

    // Check if date is already booked or blocked
    const existingBooking = await Booking.findOne({
      venueId,
      date: new Date(date),
    })

    if (existingBooking) {
      return NextResponse.json({ error: "This date is already booked or blocked" }, { status: 400 })
    }

    // Create new booking
    const booking = await Booking.create({
      venueId,
      venueName,
      customerId: session.user._id,
      customerName: session.user.name,
      customerEmail: session.user.email,
      date: new Date(date),
      status: "pending",
      notes,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}