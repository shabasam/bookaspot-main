import { connectMongoDB } from "../../../../lib/mongodb";
import UserInfo from "../../../../models/UserInfo";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    await connectMongoDB();
    const venue = await UserInfo.findById(id).populate('userId'); 
    if (!venue) {
      return NextResponse.json({ message: "Venue not found" }, { status: 404 });
    }
    return NextResponse.json(venue, { status: 200 });
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json({ message: "Failed to fetch venue" }, { status: 500 });
  }
}