import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } 
);

const PanoramaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    panoramaImage: { type: String, required: true }, 
    wallImages: [String], 
    ceilingImage: { type: String }, 
    floorImage: { type: String }, 
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
    
    

    photos: [PhotoSchema],

    panoramas: [PanoramaSchema],
  },
  { timestamps: true }
);

const UserInfo = mongoose.models?.UserInfo || mongoose.model("UserInfo", UserInfoSchema);
export default UserInfo;