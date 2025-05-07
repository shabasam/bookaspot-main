import { connectMongoDB } from "./mongodb"
import UserInfo from "../models/UserInfo"

export async function savePanorama(userId, panoramaData) {
  try {
    await connectMongoDB()

    const userInfo = await UserInfo.findOne({ userId })

    if (!userInfo) {
      throw new Error("User info not found")
    }

    if (!userInfo.panoramas) {
      userInfo.panoramas = []
    }

    userInfo.panoramas.push({
      panoramaUrl: panoramaData.panoramaUrl,
      wallImages: panoramaData.wallImages,
      ceilingImage: panoramaData.ceilingImage,
      floorImage: panoramaData.floorImage,
      createdAt: panoramaData.createdAt || new Date(),
    })

    await userInfo.save()

    return { success: true, panoramaId: userInfo.panoramas[userInfo.panoramas.length - 1]._id }
  } catch (error) {
    console.error("Error saving panorama:", error)
    throw error
  }
}

export async function getPanoramas(userId) {
  try {
    await connectMongoDB()

    const userInfo = await UserInfo.findOne({ userId })

    if (!userInfo || !userInfo.panoramas) {
      return []
    }

    return userInfo.panoramas
  } catch (error) {
    console.error("Error fetching panoramas:", error)
    throw error
  }
}

export async function getPanoramaById(userId, panoramaId) {
  try {
    await connectMongoDB()

    const userInfo = await UserInfo.findOne({ userId })

    if (!userInfo || !userInfo.panoramas) {
      return null
    }

    const panorama = userInfo.panoramas.find((p) => p._id.toString() === panoramaId)

    return panorama || null
  } catch (error) {
    console.error("Error fetching panorama by ID:", error)
    throw error
  }
}
