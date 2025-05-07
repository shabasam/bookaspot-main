"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <div className="grid grid-cols-2 w-[900px] h-[600px] shadow-2xl rounded-lg overflow-hidden outline-1">
        {/* Left Column (Image) */}
        <div className="bg-blue-100 bg-loginImg bg-cover flex justify-center items-center"></div>

        {/* Right Column (Login Form) */}
        <div className="flex flex-col justify-center items-center p-8 bg-gray-900 w-full">
          <h1 className="text-2xl font-extrabold mb-6 text-white">BOOKaSPOT</h1>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Vendor Login</h2>

          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            onClick={handleSubmit}
          >
            Login
          </button>

          <p className="mt-4 text-gray-400 flex justify-end w-full">
            <a href="/register" className="mt-2 hover:text-blue-400">
              New user? Register
            </a>
          </p>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
