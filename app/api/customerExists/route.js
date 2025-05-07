import { connectMongoDB } from "../../../lib/mongodb";
import Customer from "../../../models/customer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    await connectMongoDB();
    const user = await Customer.findOne({ email });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: "Error checking customer." }, { status: 500 });
  }
}
