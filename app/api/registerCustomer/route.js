import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Customer from "../../../models/customer";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongoDB();

    const { name, email, phone, password } = await req.json();

    // Check if required fields are present
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newCustomer.save();

    return NextResponse.json({ message: "Customer registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register customer" }, { status: 500 });
  }
}
