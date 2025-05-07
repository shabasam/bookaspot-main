"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowDown } from "react-icons/fa";

const VendorWelcome = () => {
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();
  const intervalRef = useRef(null);

  const fullMessage = `Weelcome to BookASpot!
We're excited to have you onboard as a vendor.
Showcase your convention center and connect with thousands of event organizers.`;

  useEffect(() => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < fullMessage.length) {
        setText((prev) => prev + fullMessage.charAt(i));
        i++;
      } else {
        clearInterval(intervalRef.current);
        setTimeout(() => setShowOptions(true), 500);
      }
    }, 40);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="h-screen bg-gray-900 flex justify-center items-center">
      <div className="bg-gray-900 border border-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <p className="text-white text-lg font-mono whitespace-pre-line min-h-[120px]">
          {text}
        </p>

        {showOptions && (
          <div className="mt-6 transition-opacity duration-1000 ease-in">
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="flex justify-center gap-10 animate-bounce text-white text-xl mb-2">
                <FaArrowDown />
                <FaArrowDown />
              </div>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => router.push("/loginform")}
                  className="bg-white text-gray-900 px-5 py-2 rounded hover:bg-gray-200 font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="bg-white text-gray-900 px-5 py-2 rounded hover:bg-gray-200 font-semibold"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorWelcome;
