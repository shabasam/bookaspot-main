"use server";

import { v2 as cloudinary } from "cloudinary";
import { connectMongoDB } from "../../lib/mongodb";
import UserInfo from "../../models/UserInfo";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPhotos(formData) {
  try {
    // ✅ Get session for user ID
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user || !user._id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectMongoDB();

    // ✅ Get photos from formData
    const photos = formData.getAll("photos");
    if (!photos || photos.length === 0) {
      return { success: false, error: "No photos provided" };
    }

    // ✅ Upload each photo to Cloudinary
    const uploadedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const dataURI = `data:${photo.type};base64,${base64Data}`;

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              resource_type: "image",
              folder: "next-photo-uploads",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          createdAt: new Date(),
        };
      })
    );

    // ✅ Add photos to user's UserInfo document
    await UserInfo.findOneAndUpdate(
      { userId: user._id },
      { $push: { photos: { $each: uploadedPhotos } } },
      { new: true, upsert: false }
    );

    return {
      success: true,
      photos: uploadedPhotos.map((photo) => ({
        url: photo.url,
      })),
    };
  } catch (error) {
    console.error("Error uploading photos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
