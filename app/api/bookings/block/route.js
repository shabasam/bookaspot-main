import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectMongoDB } from "../../../../lib/mongodb"
import Booking from "../../../../models/booking"
import UserInfo from "../../../../models/UserInfo"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { venueId, date, notes } = await request.json()

    if (!venueId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectMongoDB()

    const venue = await UserInfo.findOne({
      _id: venueId,
      userId: session.user._id,
    })

    if (!venue) {
      return NextResponse.json({ error: "Venue not found or not owned by you" }, { status: 404 })
    }

    const existingBooking = await Booking.findOne({
      venueId,
      date: new Date(date),
    })

    if (existingBooking) {
      return NextResponse.json({ error: "This date is already booked or blocked" }, { status: 400 })
    }

    const blockedDate = await Booking.create({
      venueId,
      venueName: venue.conventionCenter,
      customerId: session.user._id, 
      customerName: "BLOCKED",
      customerEmail: "BLOCKED",
      date: new Date(date),
      status: "blocked",
      notes: notes || "Blocked by venue owner",
    })

    return NextResponse.json(blockedDate)
  } catch (error) {
    console.error("Error blocking date:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
