import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPhoto extends Document {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  createdAt: Date
}

const PhotoSchema = new Schema<IPhoto>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  format: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Check if the model is already defined to prevent overwriting during hot reloads
export const Photo = (mongoose.models.Photo || mongoose.model<IPhoto>("Photo", PhotoSchema)) as Model<IPhoto>
