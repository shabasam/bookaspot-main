import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectMongoDB } from "../../../lib/mongodb"
import UserInfo from "../../../models/UserInfo"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conventionCenterId, panorama } = await req.json()

    if (!panorama || !panorama.panoramaImage) {
      return NextResponse.json({ error: "Missing panorama data" }, { status: 400 })
    }

    await connectMongoDB()

    // Find the user info document
    const userInfo = await UserInfo.findOne({ userId: session.user._id })

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    // Add the panorama to the panoramas array
    userInfo.panoramas = userInfo.panoramas || []
    userInfo.panoramas.push({
      name: panorama.name || "Untitled Panorama",
      description: panorama.description || "",
      panoramaImage: panorama.panoramaImage,
      wallImages: panorama.wallImages || [],
      ceilingImage: panorama.ceilingImage || null,
      floorImage: panorama.floorImage || null,
      createdAt: new Date()
    })

    // Save the updated user info
    await userInfo.save()

    // Return the newly added panorama
    const newPanorama = userInfo.panoramas[userInfo.panoramas.length - 1]

    return NextResponse.json({ 
      success: true, 
      message: "Panorama saved successfully",
      panorama: newPanorama
    })
  } catch (error) {
    console.error("Error saving panorama:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to save panorama" 
    }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const conventionCenterId = url.searchParams.get("conventionCenterId")

    await connectMongoDB()

    // Find the user info document
    const userInfo = await UserInfo.findOne({ userId: session.user._id })

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    // Return all panoramas or filter by convention center ID
    const panoramas = userInfo.panoramas || []
    
    return NextResponse.json({ 
      success: true, 
      panoramas: conventionCenterId 
        ? panoramas.filter((p) => p.conventionCenterId === conventionCenterId)
        : panoramas
    })
  } catch (error) {
    console.error("Error fetching panoramas:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch panoramas" 
    }, { status: 500 })
  }
}