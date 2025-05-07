import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectMongoDB } from "../../../../lib/mongodb"
import Booking from "../../../../models/booking"
import UserInfo from "../../../../models/UserInfo"
import { authOptions } from "../../auth/[...nextauth]/route"

// GET a specific booking
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await connectMongoDB()

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user has permission to view this booking
    if (session.user.role === "vendor") {
      // Get all venues owned by this vendor
      const venues = await UserInfo.find({ userId: session.user._id })
      const venueIds = venues.map((venue) => venue._id.toString())

      if (!venueIds.includes(booking.venueId.toString())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } else if (session.user.role === "customer" && booking.customerId.toString() !== session.user._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH update a booking status
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { status, notes } = await request.json()

    await connectMongoDB()

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only vendors can update booking status
    if (session.user.role === "vendor") {
      // Get all venues owned by this vendor
      const venues = await UserInfo.find({ userId: session.user._id })
      const venueIds = venues.map((venue) => venue._id.toString())

      if (!venueIds.includes(booking.venueId.toString())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Update booking
      booking.status = status || booking.status
      if (notes) booking.notes = notes

      await booking.save()

      // TODO: If status is "cancelled", send notification to customer
      // This would be implemented with your notification system

      return NextResponse.json(booking)
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE a booking
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await connectMongoDB()

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user has permission to delete this booking
    if (session.user.role === "vendor") {
      // Get all venues owned by this vendor
      const venues = await UserInfo.find({ userId: session.user._id })
      const venueIds = venues.map((venue) => venue._id.toString())

      if (!venueIds.includes(booking.venueId.toString())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } else if (session.user.role === "customer" && booking.customerId.toString() !== session.user._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}