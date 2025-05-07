import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectMongoDB } from "../../../../lib/mongodb"
import UserInfo from "../../../../models/UserInfo"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const panoramaId = params.id
    if (!panoramaId) {
      return NextResponse.json({ error: "Panorama ID is required" }, { status: 400 })
    }

    await connectMongoDB()

    const userInfo = await UserInfo.findOne({ userId: session.user._id })

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const panorama = userInfo.panoramas?.find((p) => p._id.toString() === panoramaId)

    if (!panorama) {
      return NextResponse.json({ error: "Panorama not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      panorama
    })
  } catch (error) {
    console.error("Error fetching panorama:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch panorama" 
    }, { status: 500 })
  }
}