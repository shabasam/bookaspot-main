import mongoose from "mongoose";

// Define the embedded photo schema
const PhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } // Optional: prevents auto-generating `_id` for each photo
);

// Add panorama schema for 360° views
const PanoramaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    panoramaImage: { type: String, required: true }, // Base64 or URL to the panorama image
    wallImages: [String], // Array of wall image URLs or base64 strings
    ceilingImage: { type: String }, // URL or base64 of ceiling image
    floorImage: { type: String }, // URL or base64 of floor image
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserInfoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conventionCenter: { type: String, required: true },
    capacity: { type: Number, required: true },
    contact: { type: String, required: true },
    cost: { type: String, required: true },
    gmap: { type: String, required: true },
    address: { type: String, required: true },
    typeofevent: { type: String, required: true },
    description: { type: String },
    
    

    // ✅ Add embedded photos array
    photos: [PhotoSchema],

    // Add panoramas array for 360° views
    panoramas: [PanoramaSchema],
  },
  { timestamps: true }
);

const UserInfo = mongoose.models?.UserInfo || mongoose.model("UserInfo", UserInfoSchema);
export default UserInfo;