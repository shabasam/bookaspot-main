// models/customer.js
import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String, // or Number, but String is safer for mobile numbers
      required: true,
    },
  },
  { timestamps: true }
);

// Avoid model overwrite error in development
const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
