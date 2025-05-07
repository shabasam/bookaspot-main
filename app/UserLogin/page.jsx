"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/"); // Redirect to homepage
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <div className="grid grid-cols-2 w-[1100px] h-[700px] shadow-2xl rounded-lg overflow-hidden">
        {/* Left side image */}
        <div className="bg-blue-100 bg-loginImg bg-cover"></div>

        {/* Right side login form */}
        <div className="flex flex-col justify-center items-center p-6 bg-gray-900 w-full">
          <h1 className="text-2xl font-extrabold mb-6 text-white">BOOKaSPOT</h1>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Customer Login</h2>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mb-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-gray-400 flex justify-end w-full">
            <a href="/UserRegister" className="mt-2 hover:text-blue-400">
              New user? Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
