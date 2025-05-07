"use client"

import { useRef } from "react"
import { Button } from "../components/ui/button"
import { Eye } from 'lucide-react'
import { useToast } from "../app/hooks/use-toast"

export default function PanoramaViewer({ panoramaImage, name = "360° View" }) {
  const pannellumInstance = useRef(null)
  const { toast } = useToast()

  const openStandaloneViewer = () => {
    if (!panoramaImage) {
      toast({
        title: "Error",
        description: "Panorama image not available",
        variant: "destructive",
      })
      return
    }

    const viewerWindow = window.open("", "_blank")

    if (!viewerWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to open the 360° viewer",
        variant: "destructive",
      })
      return
    }

    viewerWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${name} - 360° Panorama Viewer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
          #panorama { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="panorama"></div>
        <script>
          window.onload = function() {
            pannellum.viewer('panorama', {
              type: "equirectangular",
              panorama: "${panoramaImage}",
              autoLoad: true,
              showControls: true,
              hfov: 100,
              minHfov: 50,
              maxHfov: 120,
              autoRotate: 2,
              friction: 0.15,
              yaw: 0,
              pitch: 0,
              haov: 360,
              vaov: 180,
              mouseZoom: true,
              keyboardZoom: true,
              draggable: true,
              showZoomCtrl: true,
              showFullscreenCtrl: true,
            });
          };
        </script>
      </body>
      </html>
    `)

    viewerWindow.document.close()
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={openStandaloneViewer} className="flex items-center">
        <Eye className="w-4 h-4 mr-2" />
        View 360° (Fullscreen)
      </Button>
    </div>
  )
}
