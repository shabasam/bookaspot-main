"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { signOut } from "next-auth/react";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      
      <span className="text-xl font-bold text-black">BOOKaSPOT</span>

      
      <div className="flex space-x-6">
        <Link href="/dashboard" className="nav-link text-black">
          Today
        </Link>
        
        <Link href="/listings" className="nav-link text-black">
          Listings
        </Link>
      </div>

      
      <div className="relative" ref={dropdownRef}>
        <FaUserCircle
          className="text-2xl text-black cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        />

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-20">
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 border border-red-500 hover:bg-gray-100 hover:border-red-600 rounded"
              
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      
      <style jsx>{`
        .nav-link {
          position: relative;
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: #000;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -4px;
          width: 0;
          height: 2px;
          background-color: black;
          transition: width 0.3s ease, left 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
          left: 0;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
