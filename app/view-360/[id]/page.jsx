"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useToast } from "../../hooks/use-toast"

export default function View360Page() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [panorama, setPanorama] = useState(null)
  const [loading, setLoading] = useState(true)
  const viewerRef = useRef(null)
  const pannellumInstance = useRef(null)

  useEffect(() => {
    const fetchPanorama = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/panoramas/${params.id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch panorama")
        }
        
        const data = await response.json()
        setPanorama(data.panorama)
      } catch (error) {
        console.error("Error fetching panorama:", error)
        toast({
          title: "Error",
          description: "Failed to load the 360° view. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchPanorama()
    }
  }, [params.id, toast])

  useEffect(() => {
    if (loading || !panorama?.panoramaImage || !viewerRef.current) return

    const loadPannellum = async () => {
      try {
        if (!window.pannellum) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
          document.head.appendChild(link)

          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
          })
        }

        setTimeout(() => {
          initializeViewer()
        }, 500)
      } catch (error) {
        console.error("Failed to load Pannellum:", error)
        toast({
          title: "Error",
          description: "Failed to load the 360° viewer. Please try again.",
          variant: "destructive",
        })
      }
    }

    const initializeViewer = () => {
      if (!viewerRef.current || !window.pannellum) {
        console.error("Viewer ref or Pannellum not available")
        return
      }

      try {
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
          type: "equirectangular",
          panorama: panorama.panoramaImage,
          autoLoad: true,
          showControls: true,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
          autoRotate: 2,
          autoRotateInactivityDelay: 1000,
          friction: 0.15,
          yaw: 0,
          pitch: 0,
          haov: 360,
          vaov: 180,
          vOffset: 0,
          mouseZoom: true,
          keyboardZoom: true,
          draggable: true,
          disableKeyboardCtrl: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          hotSpotDebug: false,
          sceneFadeDuration: 1000,
        })
      } catch (error) {
        console.error("Error initializing panorama viewer:", error)
        toast({
          title: "Viewer Error",
          description: "There was a problem initializing the 360° viewer. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadPannellum()

    return () => {
      if (pannellumInstance.current) {
        try {
          pannellumInstance.current.destroy()
        } catch (e) {
          console.error("Error destroying panorama viewer:", e)
        }
      }
    }
  }, [loading, panorama, toast])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{panorama?.name || "360° View"}</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading 360° view...</p>
            </div>
          </div>
        ) : panorama ? (
          <>
            <div className="p-4 bg-muted">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold mb-2">{panorama.name}</h2>
                {panorama.description && <p className="text-muted-foreground mb-4">{panorama.description}</p>}
              </div>
            </div>
            <div ref={viewerRef} className="flex-1" style={{ minHeight: "calc(100vh - 180px)" }}></div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-2">Panorama Not Found</h2>
              <p className="text-muted-foreground mb-4">The 360° view you're looking for could not be found.</p>
              <Button onClick={() => router.push("/listings")}>Go to Listings</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}