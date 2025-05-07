import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

const cached = global.mongoose || { conn: null, promise: null }

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}

// Add this alias for compatibility with the new code
const connectDB = connectMongoDB

if (process.env.NODE_ENV === "development") {
  // In development mode, keep the Mongo connection cached to avoid reconnecting
  global.mongoose = cached
}

export default connectDB


