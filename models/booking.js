import mongoose, { Schema } from "mongoose"

const bookingSchema = new Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    venueName: {
      type: String,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create a compound index to prevent double bookings
bookingSchema.index({ venueId: 1, date: 1 }, { unique: true })

const Booking = mongoose.models?.Booking || mongoose.model("Booking", bookingSchema)
export default Booking
