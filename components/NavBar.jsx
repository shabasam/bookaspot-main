"use client";

import Link from "next/link";
import React from "react";
import { signOut, useSession } from "next-auth/react";

const NavBar = () => {
  const { data: session, status } = useSession(); 

  return (
    <nav className="bg-black p-4">
      <div className="container drop-shadow-2xl mx-4 flex justify-between">
        <Link href="/" className="text-2xl font-bold cursor-pointer text-white">
          BOOKaSPOT
        </Link>

        <div className="flex mr-4 space-x-4 items-center">
          {status === "loading" ? (
            <span className="text-white">Loading...</span>
          ) : !session ? (
            <>
              <a href="/UserLogin" className="text-white hover:text-blue-500">LOGIN</a>
              <a href="/UserRegister" className="text-white hover:text-blue-500">REGISTER</a>
              <a href="/vendorhomepage" className="text-white hover:text-blue-500">VENDOR</a>
              <Link href="#" className="text-white hover:text-blue-400">CONTACT</Link>
            </>
          ) : (
            <>
              <span className="text-white">Welcome, {session.user?.name || session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-white hover:text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
