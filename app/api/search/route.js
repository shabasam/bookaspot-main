import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import UserInfo from "../../../models/UserInfo";

export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB(); 

    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const location = searchParams.get("location");

    if (!eventType || !location) {
      return NextResponse.json(
        { error: "Both event type and location are required" },
        { status: 400 }
      );
    }

    const results = await UserInfo.find({
      typeofevent: { $regex: new RegExp(eventType, "i") },
      address: { $regex: new RegExp(location, "i") },
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
