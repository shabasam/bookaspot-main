"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }
  
    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      const { user } = await resUserExists.json();
  
      if (user) {
        setError("User already exists.");
        return;
      }
  
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
  
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
  
        router.push("/loginform");
      } else {
        setError("User registration failed.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error during registration: ", error);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
      <div className="grid grid-cols-2 w-[1100px] h-[700px] shadow-2xl rounded-lg overflow-hidden">
        
        {/* Left Side (Image) */}
        <div className="bg-blue-100 bg-loginImg bg-cover"></div>

        {/* Right Side (Register Form) */}
        <div className="flex flex-col justify-center items-center p-6 bg-gray-900 w-full">
          <h1 className="text-2xl font-extrabold mb-6 text-white">BOOKaSPOT</h1>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Vendor Register</h2>
          
          <input onChange={(e) => setName(e.target.value)} type="text" placeholder="Full Name" className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white" />
          <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white" />
          <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Confirm Password" className="w-full p-2 border rounded-md mb-3 bg-gray-800 text-white" />

          <button className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600" onClick={handleSubmit}>
            Register
          </button>
          <p className="mt-4 text-gray-400 flex justify-end w-full">
          <a href="/loginform" className="mt-2 hover:text-blue-400 ">Already a user? Login</a>
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
