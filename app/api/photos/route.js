import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { Photo } from "../../../lib/models/photo"

export async function GET() {
  try {
    await connectToDatabase()

    const photos = await Photo.find().sort({ createdAt: -1 })

    return NextResponse.json({ success: true, photos })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch photos" }, { status: 500 })
  }
}
