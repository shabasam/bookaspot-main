"use client"
import Navbar from "../../components/Navbar_vendor"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import PhotoUploadForm from "../../components/photo-upload-form"
import PanoramaGenerator from "../../components/PanoramaGenerator"
import PanoramaViewer from "../../components/PanoramaViewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Plus } from 'lucide-react'

const ListingsPage = () => {
  const router = useRouter()

  const [listings, setListings] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showPanoramaGenerator, setShowPanoramaGenerator] = useState(false)
  const [panoramas, setPanoramas] = useState([])
  const [activeTab, setActiveTab] = useState("details")

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    contact: "",
    cost: "",
    gmap: "",
    address: "",
    typeofevent: "",
    image: "",
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/userinfo")
        if (res.ok) {
          const data = await res.json()

          if (data && data.conventionCenter) {
            const formattedListing = {
              conventionCenter: data.conventionCenter || "",
              capacity: data.capacity || "",
              contact: data.contact || "",
              cost: data.cost || "",
              gmap: data.gmap || "",
              address: data.address || "",
              typeofevent: data.typeofevent || "",
              image: data.image || "",
              photos: data.photos || [],
              panoramas: data.panoramas || [],
            }

            setFormData(formattedListing)
            setListings([formattedListing])
            setPanoramas(data.panoramas || [])
            setShowPhotoUpload(true)
          }
        }
      } catch (err) {
        console.error("Error fetching user info:", err)
      }
    }

    fetchUserInfo()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && typeof window !== "undefined") {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Image = reader.result
        setImagePreview(base64Image)
        setFormData((prev) => ({ ...prev, image: base64Image }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/userinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conventionCenter: formData.name,
          capacity: formData.capacity,
          contact: formData.contact,
          cost: formData.cost,
          gmap: formData.gmap,
          address: formData.address,
          typeofevent: formData.typeofevent,
          image: formData.image,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong")
      }

      const saved = await response.json()
      const formattedSaved = {
        conventionCenter: saved.conventionCenter,
        capacity: saved.capacity,
        contact: saved.contact,
        cost: saved.cost,
        gmap: saved.gmap,
        address: saved.address,
        typeofevent: saved.typeofevent,
        image: saved.image,
      }

      setListings([formattedSaved])
      setShowModal(false)
      setImagePreview(null)
      setShowPhotoUpload(true)
    } catch (error) {
      alert(error.message)
    }
  }

  const handlePanoramaCreated = (newPanorama) => {
    setPanoramas((prev) => [...prev, newPanorama])
    setShowPanoramaGenerator(false)
    setActiveTab("panoramas")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="flex justify-between items-center mb-6 mt-20">
        <h1 className="text-2xl font-bold text-black">Your Listings</h1>
      </div>

      {listings.length === 0 && (
        <div className="flex flex-col items-center justify-center h-96 text-gray-600">
          <p className="mb-4">No listings yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Your First Listing
          </button>
        </div>
      )}

      {listings.length > 0 && (
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
            {listings.map((venue, index) => (
              <div key={index} className="bg-white rounded-xl text-black shadow p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="panoramas">360° Views</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="h-48 bg-gray-300 flex items-center justify-center rounded mb-4 overflow-hidden shadow-lg max-w-4xl mx-auto">
                      {venue.photos && venue.photos.length > 0 ? (
                        <Image
                          src={venue.photos[0].url || "/placeholder.svg"}
                          alt={venue.conventionCenter}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover rounded"
                          unoptimized
                        />
                      ) : venue.image ? (
                        <Image
                          src={venue.image || "/placeholder.svg"}
                          alt={venue.conventionCenter}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover rounded"
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-600">No image available</span>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{venue.conventionCenter}</h3>
                        <p>
                          <strong>Capacity:</strong> {venue.capacity}
                        </p>
                        <p>
                          <strong>Cost:</strong> ₹{venue.cost}
                        </p>
                        <p>
                          <strong>Contact:</strong> {venue.contact}
                        </p>
                        <p>
                          <strong>Event Type:</strong> {venue.typeofevent}
                        </p>
                        <p className="text-black">
                          <strong>Location:</strong> {venue.address}
                        </p>
                        {venue.gmap && (
                          <a
                            href={venue.gmap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline mt-2 inline-block"
                          >
                            View on Google Maps
                          </a>
                        )}
                      </div>
                      <button
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => setShowModal(true)}
                      >
                        Edit
                      </button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="photos">
                    <div className="bg-white p-6 rounded-xl text-black">
                      <h2 className="text-xl font-bold mb-2">Photos</h2>
                      {venue.photos && venue.photos.length > 0 ? (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {venue.photos.map((photo, photoIndex) => (
                              <div key={photoIndex} className="h-48 overflow-hidden rounded">
                                <Image
                                  src={photo.url || "/placeholder.svg"}
                                  alt={`${venue.conventionCenter} photo ${photoIndex + 1}`}
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 mb-4">No photos uploaded yet.</p>
                      )}
                      <PhotoUploadForm venueName={venue.conventionCenter} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="panoramas">
                    <div className="bg-white p-6 rounded-xl text-black">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">360° Views</h2>
                        <Button 
                          onClick={() => setShowPanoramaGenerator(true)} 
                          className="flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New 360° View
                        </Button>
                      </div>
                      
                      {panoramas.length > 0 ? (
                        <div className="grid gap-6">
                          {panoramas.map((panorama, i) => (
                            <div key={i} className="border rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-2">{panorama.name}</h3>
                              {panorama.description && (
                                <p className="text-gray-600 mb-4">{panorama.description}</p>
                              )}
                              <div className="mb-4 h-48 overflow-hidden rounded-lg">
                                <img 
                                  src={panorama.panoramaImage || "/placeholder.svg"} 
                                  alt={panorama.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <PanoramaViewer 
                                panoramaImage={panorama.panoramaImage} 
                                name={panorama.name} 
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-600">
                          <p className="mb-4">No 360° views created yet.</p>
                          <p>Create your first 360° view to give visitors an immersive experience of your venue.</p>
                        </div>
                      )}
                      
                      {showPanoramaGenerator && (
                        <div className="mt-8 border-t pt-6">
                          <PanoramaGenerator 
                            conventionCenterId={venue._id} 
                            conventionCenterName={venue.conventionCenter}
                            onPanoramaCreated={handlePanoramaCreated}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold text-black mb-4">Upload Convention Center</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Convention Center Name</label>
                <input
                  name="name"
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  name="capacity"
                  type="number"
                  className="w-full border p-2 rounded"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  name="contact"
                  className="w-full border p-2 rounded"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  name="cost"
                  type="number"
                  className="w-full border p-2 rounded"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                <input
                  name="gmap"
                  className="w-full border p-2 rounded"
                  value={formData.gmap}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="" disabled>
                    Select Location
                  </option>
                  <option value="Kochi">Kochi</option>
                  <option value="Trivandrum">Trivandrum</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Calicut">Calicut</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Event</label>
                <select
                  name="typeofevent"
                  value={formData.typeofevent}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="" disabled>
                    Select Type of Event
                  </option>
                  <option value="Conference & Seminars">Conference & Seminars</option>
                  <option value="Weddings">Weddings</option>
                  <option value="Trade Shows & Expos">Trade Shows & Expos</option>
                  <option value="Concerts & Cultural Events">Concerts & Cultural Events</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setImagePreview(null)
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingsPage