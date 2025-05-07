"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const typeofevent = searchParams.get("typeofevent");
    const address = searchParams.get("address");

    if (typeofevent && address) {
      fetch(`/api/search?typeofevent=${typeofevent}&address=${address}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((err) => console.error(err));
    }
  }, [searchParams]);

  return (
    <div className="p-4">


      <h1 className="text-2xl font-bold">Search Results</h1>
      <div className="grid grid-cols-3 gap-4">
        {results.map((venue) => (
          <div
            key={venue._id}
            className="bg-white p-4 rounded-lg shadow-lg cursor-pointer"
            onClick={() => router.push(`/details/${venue._id}`)}
          >
            <h2 className="text-xl font-semibold">{venue.conventionCenter}</h2>
            <p>{venue.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


