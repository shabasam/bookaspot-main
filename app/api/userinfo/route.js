import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "../../../lib/mongodb";
import UserInfo from "../../../models/UserInfo";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?._id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectMongoDB();
  const userInfo = await UserInfo.findOne({ userId: session.user._id });

  return new Response(JSON.stringify(userInfo || {}), { status: 200 });
}

export async function POST(req) {
  return handleSave(req);
}

export async function PUT(req) {
  return handleSave(req);
}

async function handleSave(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { conventionCenter, capacity, contact, cost, gmap, address, typeofevent } = await req.json();
    await connectMongoDB();

    const existingUser = await UserInfo.findOne({ userId: session.user._id });

    if (existingUser) {
      await UserInfo.updateOne({ userId: session.user._id }, { conventionCenter, capacity, contact, cost, gmap, address, typeofevent });
      return new Response(JSON.stringify({ message: "User info updated successfully" }), { status: 200 });
    } else {
      const newUserInfo = new UserInfo({ userId: session.user._id, name: session.user.name, email: session.user.email, conventionCenter, capacity, contact, cost, gmap, address, typeofevent });
      await newUserInfo.save();
      return new Response(JSON.stringify({ message: "User info saved successfully" }), { status: 201 });
    }
  } catch (error) {
    console.error("Error saving user info:", error);
    return new Response(JSON.stringify({ error: "Failed to save user info" }), { status: 500 });
  }
}
