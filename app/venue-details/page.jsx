"use client";
import NavBar from "../../components/NavBar";
import { useSearchParams } from "next/navigation";
import { MapPin, Phone, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import PanoramaViewer from "../../components/PanoramaViewer"; // Import the PanoramaViewer component

export default function VenueDetails() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const capacity = searchParams.get("capacity");
  const location = searchParams.get("location");
  const cost = searchParams.get("cost");
  const contact = searchParams.get("contact");
  const gmap = searchParams.get("gmap");
  const id = searchParams.get("id");

  const [venueDetails, setVenueDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [panoramaImage, setPanoramaImage] = useState(null); // Add state for panorama image

  useEffect(() => {
    if (!id) {
      setError("Venue ID not provided.");
      setLoading(false);
      return;
    }

    const fetchVenueDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch venue details
        const response = await fetch(`/api/venues/${id}`);
        if (!response.ok) {
          const message = `An error occurred: ${response.status}`;
          throw new Error(message);
        }
        const data = await response.json();
        setVenueDetails(data);

        // Check if the venue has panoramas
        if (data.panoramas && data.panoramas.length > 0) {
          // Get the first panorama or the most recent one
          setPanoramaImage(data.panoramas[0].panoramaImage);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [id]);

  if (loading) {
    return <div>Loading venue details...</div>;
  }

  if (error) {
    return <div>Error loading venue details: {error}</div>;
  }

  const photos = venueDetails?.photos || [];
  const displayedPhotos = showAllPhotos ? photos : photos.slice(0, 3);
  const remainingPhotosCount = photos.length - 3;

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-black">
        <NavBar />
      </div>

      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Display images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {displayedPhotos.length > 0 ? (
            displayedPhotos.map((photo) => (
              <div
                key={photo.url}
                className="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-md shadow-md cursor-pointer"
                onClick={() => handleImageClick(photo.url)}
              >
                <Image
                  src={photo.url}
                  alt={venueDetails?.conventionCenter || "Venue Image"}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md transition-transform duration-300 hover:scale-105"
                  unoptimized
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-gray-500 flex justify-center items-center h-48 rounded-md shadow-md">
              No images available
            </div>
          )}
          {photos.length > 3 && !showAllPhotos && (
            <div
              className="col-span-full md:col-span-1 lg:col-span-1 bg-gray-200 flex items-center justify-center rounded-md shadow-md cursor-pointer text-gray-600 hover:bg-gray-300"
              onClick={() => setShowAllPhotos(true)}
            >
              +{remainingPhotosCount} more
            </div>
          )}
          {photos.length > 3 && showAllPhotos && (
            <div
              className="col-span-full bg-gray-200 flex items-center justify-center rounded-md shadow-md cursor-pointer text-gray-600 hover:bg-gray-300"
              onClick={() => setShowAllPhotos(false)}
            >
              Show less
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl text-black font-semibold">{venueDetails?.conventionCenter || name}</h2>
          </div>

          {venueDetails?.address || location ? (
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin size={18} className="mr-1 text-gray-500" />
              {venueDetails?.address || location}
            </div>
          ) : null}

          <ul className="text-gray-700 space-y-1 text-sm mb-6">
            {venueDetails?.capacity || capacity ? (
              <li>
                <strong>Capacity:</strong> {venueDetails?.capacity || capacity}
              </li>
            ) : null}
            {venueDetails?.cost || cost ? (
              <li>
                <strong>Cost:</strong> {venueDetails?.cost || cost}
              </li>
            ) : null}
            {venueDetails?.contact || contact ? (
              <li>
                <strong>Contact:</strong>{" "}
                <a href={`tel:${venueDetails?.contact || contact}`} className="text-green-600 inline-flex items-center">
                  <Phone size={14} className="mr-1" /> {venueDetails?.contact || contact}
                </a>
              </li>
            ) : null}
            {venueDetails?.description && (
              <li>
                <strong>Description:</strong> {venueDetails.description}
              </li>
            )}
          </ul>

          <div className="flex justify-between items-center flex-wrap gap-2">  
            <div className="flex gap-2">
              {venueDetails?.gmap || gmap ? (
                <a
                  href={venueDetails?.gmap || gmap}
                  className="text-blue-600 underline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              ) : null}
            </div>

            <div className="flex gap-2 text-black">
              {/* 360° View Button - Only show if panorama is available */}
              {panoramaImage && (
                <PanoramaViewer 
                  panoramaImage={panoramaImage} 
                  name={`${venueDetails?.conventionCenter || name} - 360° View`} 
                />
              )}

              <Link
                href={`/venuebooking_customer?name=${encodeURIComponent(venueDetails?.conventionCenter || name || "")}&id=${encodeURIComponent(id || "")}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-sm text-sm"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Enlargement Modal */}
      {selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex justify-center items-center cursor-pointer" onClick={handleCloseModal}>
          <Image
            src={selectedImage}
            alt="Enlarged Venue Image"
            layout="intrinsic"
            width={800}
            height={600}
            className="rounded-md"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}