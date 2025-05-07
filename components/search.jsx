"use client";
import NavBar from "./NavBar";
import { BiSearchAlt } from "react-icons/bi";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Search() {
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const eventTypes = [
    "Conferences & Seminars",
    "Trade Shows & Expos",
    "Weddings",
    "Concerts & Cultural Events",
    "Corporate Meetings & Product Launches",
  ];

  const locations = ["Kochi", "Trivandrum", "Thrissur", "Calicut"];
  const router = useRouter();


  const handleSearch = () => {
    if (!eventType || !location) {
      setError("Please select both Event Type and Location");
      return;
    }

    setError("");

    // Open results page in a new tab
    const url = `/results?eventType=${encodeURIComponent(eventType)}&location=${encodeURIComponent(location)}`;
    router.push(url);

  };

  return (
    <div className="bg-black overflow-x-hidden">
      <section className="bg-bannerImg relative bg-fixed bg-no-repeat bg-cover w-screen h-screen">
        <main>
          <div className="w-full h-screen flex flex-col absolute inset-0 bg-gradient-to-b from-transparent to-black/100 z-0 mt-28">
            <h1 className="text-white text-7xl text-center mt-52 z-10">Plan big, book smart!</h1>
            <h6 className="text-white text-3xl text-center z-10">From small meetups to grand celebrations—we got you!</h6>
            <div className="flex flex-row justify-center mt-8 mx-auto gap-3 z-10">
              <select
                className="w-3/4 rounded-full p-2 px-3 text-black"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">Type of event</option>
                {eventTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="w-1/4 rounded-full p-2 px-3 text-black"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Location</option>
                {locations.map((loc, index) => (
                  <option key={index} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <BiSearchAlt className="cursor-pointer w-10 h-10" onClick={handleSearch} />
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
