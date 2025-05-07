"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const resUserExists = await fetch("/api/customerExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("Customer already exists.");
        return;
      }

      const res = await fetch("/api/registerCustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        router.push("/UserLogin");
      } else {
        setError("Customer registration failed.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <div className="grid grid-cols-2 w-[1100px] h-[700px] shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-green-100 bg-loginImg bg-cover"></div>

        <div className="flex flex-col justify-center items-center p-6 bg-gray-900 w-full">
          <h1 className="text-2xl font-extrabold mb-6 text-white">BOOKaSPOT</h1>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Customer Register</h2>

          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />
          <input
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Phone Number"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white"
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
          >
            Register
          </button>

          <p className="mt-4 text-gray-400 flex justify-end w-full">
            <a href="/UserLogin" className="mt-2 hover:text-blue-400">Already a user? Login</a>
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
