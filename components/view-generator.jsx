"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Info, Camera, ArrowUp, ArrowDown, Eye } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "../components/ui/progress"
import { useToast } from "../app/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent } from "../components/ui/dialog"

export default function View360Generator({ onPanoramaGenerated, conventionCenterId }) {
  const [wallFiles, setWallFiles] = useState([])
  const [ceilingFile, setCeilingFile] = useState(null)
  const [floorFile, setFloorFile] = useState(null)
  const [wallPreviews, setWallPreviews] = useState([])
  const [ceilingPreview, setCeilingPreview] = useState(null)
  const [floorPreview, setFloorPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [panoramaPreview, setPanoramaPreview] = useState(null)
  const [showViewer, setShowViewer] = useState(false)
  const viewerRef = useRef(null)
  const pannellumInstance = useRef(null)
  const { toast } = useToast()

  const handleWallFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setWallFiles((prev) => [...prev, ...selectedFiles])

      // Create previews
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setWallPreviews((prev) => [...prev, e.target.result])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCeilingFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setCeilingFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setCeilingPreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFloorFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFloorFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setFloorPreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeWallFile = (index) => {
    setWallFiles(wallFiles.filter((_, i) => i !== index))
    setWallPreviews(wallPreviews.filter((_, i) => i !== index))
  }

  const removeCeilingFile = () => {
    setCeilingFile(null)
    setCeilingPreview(null)
  }

  const removeFloorFile = () => {
    setFloorFile(null)
    setFloorPreview(null)
  }

  const generatePanorama = async () => {
    if (wallFiles.length < 2) {
      toast({
        title: "Not enough wall images",
        description: "Please upload at least 2 wall images to create a 360° view",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      // Create a panorama by stitching wall images side by side
      const panoramaImage = await createSimplePanorama(wallPreviews, ceilingPreview, floorPreview)
      setProgress(100)
      setPanoramaPreview(panoramaImage)
      setIsUploading(false)

      // Call the callback function with the generated panorama URL
      onPanoramaGenerated(panoramaImage)

      toast({
        title: "Success!",
        description: "Your 360° spatial view has been generated. You can now view or submit it.",
        variant: "default",
      })
    } catch (error) {
      setIsUploading(false)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create panorama",
        variant: "destructive",
      })
    }
  }

  // Initialize the 360° viewer when the dialog is opened
  useEffect(() => {
    if (!showViewer || !panoramaPreview || !viewerRef.current) return

    // Create a loading indicator
    const loadingDiv = document.createElement("div")
    loadingDiv.className = "absolute inset-0 flex items-center justify-center bg-black/50 text-white"
    loadingDiv.innerHTML =
      '<div class="text-center"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div><p>Loading 360° viewer...</p></div>'
    viewerRef.current.appendChild(loadingDiv)

    // Load the pannellum script and stylesheet
    const loadPannellum = async () => {
      try {
        // Check if Pannellum is already loaded
        if (!window.pannellum) {
          // Load CSS
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
          document.head.appendChild(link)

          // Load JS
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
          })
        }

        // Wait a moment to ensure everything is loaded
        setTimeout(() => {
          initializeViewer()
          if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv)
          }
        }, 500)
      } catch (error) {
        console.error("Failed to load Pannellum:", error)
        toast({
          title: "Error",
          description: "Failed to load the 360° viewer. Please try again.",
          variant: "destructive",
        })
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv)
        }
      }
    }

    const initializeViewer = () => {
      if (!viewerRef.current || !window.pannellum) {
        console.error("Viewer ref or Pannellum not available")
        return
      }

      // Clear the viewer container first
      viewerRef.current.innerHTML = ""

      try {
        // Initialize the viewer with enhanced settings for a spatial view
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
          type: "equirectangular",
          panorama: panoramaPreview,
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
  }, [showViewer, panoramaPreview, toast])

  // Simplified panorama creation - just stitch images side by side
  const createSimplePanorama = async (wallImages, ceilingImage, floorImage) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas for the equirectangular panorama
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not create canvas context"))
          return
        }

        // Set timeout to prevent browser hanging
        const timeout = setTimeout(() => {
          reject(new Error("Panorama creation timed out"))
        }, 30000) // 30 seconds timeout

        // Standard equirectangular ratio is 2:1 (360° horizontal by 180° vertical)
        canvas.width = 4096
        canvas.height = 2048

        // Fill with black background
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        setProgress(20)

        // Load all wall images
        const loadImage = (src) => {
          return new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => resolve(img)
            img.src = src
          })
        }

        // Load all images in parallel
        Promise.all(wallImages.map((src) => loadImage(src)))
          .then((images) => {
            setProgress(50)

            // Calculate the width of each wall segment
            const segmentWidth = canvas.width / images.length

            // Draw wall images in sequence - ensure they cover the middle section properly
            images.forEach((img, i) => {
              const x = i * segmentWidth
              const y = canvas.height / 4 // Start at 1/4 from the top
              const height = canvas.height / 2 // Middle half of the canvas

              // Draw the image, stretching it to fill its segment
              ctx.drawImage(img, x, y, segmentWidth, height)
            })

            setProgress(80)

            // Add ceiling and floor if available
            const processCeilingAndFloor = async () => {
              if (ceilingImage) {
                try {
                  const ceilingImg = await loadImage(ceilingImage)
                  // Draw ceiling at the top quarter - stretch to fill the width
                  ctx.drawImage(ceilingImg, 0, 0, canvas.width, canvas.height / 4)
                } catch (e) {
                  console.error("Error loading ceiling image:", e)
                }
              }

              if (floorImage) {
                try {
                  const floorImg = await loadImage(floorImage)
                  // Draw floor at the bottom quarter - stretch to fill the width
                  ctx.drawImage(floorImg, 0, (canvas.height * 3) / 4, canvas.width, canvas.height / 4)
                } catch (e) {
                  console.error("Error loading floor image:", e)
                }
              }

              // Finalize the panorama
              clearTimeout(timeout)

              // Convert to a high-quality JPEG
              const panoramaDataUrl = canvas.toDataURL("image/jpeg", 0.9)
              resolve(panoramaDataUrl)
            }

            processCeilingAndFloor()
          })
          .catch((err) => {
            clearTimeout(timeout)
            console.error("Error creating panorama:", err)
            reject(err)
          })
      } catch (error) {
        console.error("Exception in panorama creation:", error)
        reject(error)
      }
    })
  }

  const openStandaloneViewer = () => {
    if (!panoramaPreview) {
      toast({
        title: "Missing panorama",
        description: "Please generate a 360° view first",
        variant: "destructive",
      })
      return
    }

    // Create a new window for the viewer
    const viewerWindow = window.open("", "_blank")

    if (!viewerWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to open the 360° viewer",
        variant: "destructive",
      })
      return
    }

    // Write the HTML content for the viewer
    viewerWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>360° Panorama Viewer</title>
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
              panorama: "${panoramaPreview}",
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
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate 360° View</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="walls" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="walls" className="flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Wall Photos
              </TabsTrigger>
              <TabsTrigger value="ceiling" className="flex items-center">
                <ArrowUp className="w-4 h-4 mr-2" />
                Ceiling Photo
              </TabsTrigger>
              <TabsTrigger value="floor" className="flex items-center">
                <ArrowDown className="w-4 h-4 mr-2" />
                Floor Photo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="walls" className="mt-4">
              <div className="mb-4">
                <p className="mb-4 text-muted-foreground">For best results, follow these guidelines:</p>
                <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                  <li>Take photos of your convention center walls in sequence, moving in a complete circle</li>
                  <li>Each photo should overlap with the previous one by about 30%</li>
                  <li>Keep the camera at the same height and distance from walls for all photos</li>
                  <li>Try to maintain consistent lighting across all photos</li>
                </ul>
              </div>

              <label htmlFor="wall-upload" className="block w-full">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag wall photos here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Support for JPG, PNG • Any number of images</p>
                </div>
                <input
                  id="wall-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleWallFileChange}
                  disabled={isUploading}
                />
              </label>

              {wallPreviews.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-4 text-lg font-semibold">Wall Photos ({wallPreviews.length})</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {wallPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Wall Preview ${index + 1}`}
                          className="object-cover w-full rounded-md aspect-square"
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100 rounded-md">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => removeWallFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute px-2 py-1 text-xs font-medium text-white bg-black/60 top-2 left-2 rounded-md">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ceiling" className="mt-4">
              <div className="mb-4">
                <p className="mb-4 text-muted-foreground">For the best ceiling view:</p>
                <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                  <li>Stand in the center of the convention center and point your camera directly upward</li>
                  <li>Try to capture the entire ceiling in a single shot</li>
                  <li>Ensure good lighting to capture ceiling details</li>
                </ul>
              </div>

              <label htmlFor="ceiling-upload" className="block w-full">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <ArrowUp className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag ceiling photo here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Support for JPG, PNG • Single image</p>
                </div>
                <input
                  id="ceiling-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCeilingFileChange}
                  disabled={isUploading}
                />
              </label>

              {ceilingPreview && (
                <div className="mt-6">
                  <h2 className="mb-4 text-lg font-semibold">Ceiling Photo</h2>
                  <div className="relative group">
                    <img
                      src={ceilingPreview || "/placeholder.svg"}
                      alt="Ceiling Preview"
                      className="object-cover w-full rounded-md aspect-square max-w-xs mx-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100 rounded-md max-w-xs mx-auto">
                      <Button variant="destructive" size="icon" className="w-8 h-8" onClick={removeCeilingFile}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="floor" className="mt-4">
              <div className="mb-4">
                <p className="mb-4 text-muted-foreground">For the best floor view:</p>
                <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                  <li>Stand in the center of the convention center and point your camera directly downward</li>
                  <li>Try to capture the entire floor in a single shot</li>
                  <li>Ensure good lighting to capture floor details</li>
                </ul>
              </div>

              <label htmlFor="floor-upload" className="block w-full">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <ArrowDown className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag floor photo here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Support for JPG, PNG • Single image</p>
                </div>
                <input
                  id="floor-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFloorFileChange}
                  disabled={isUploading}
                />
              </label>

              {floorPreview && (
                <div className="mt-6">
                  <h2 className="mb-4 text-lg font-semibold">Floor Photo</h2>
                  <div className="relative group">
                    <img
                      src={floorPreview || "/placeholder.svg"}
                      alt="Floor Preview"
                      className="object-cover w-full rounded-md aspect-square max-w-xs mx-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100 rounded-md max-w-xs mx-auto">
                      <Button variant="destructive" size="icon" className="w-8 h-8" onClick={removeFloorFile}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mb-4 text-sm text-primary">
                    <Info className="w-4 h-4 mr-1" />
                    <span>What makes a complete 360° view?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    A complete 360° view includes wall photos for horizontal view, plus ceiling and floor photos for
                    vertical view. This creates a true spatial experience where users can look in all directions.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isUploading ? (
            <div className="space-y-4">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-center text-muted-foreground">Processing your images... {Math.round(progress)}%</p>
            </div>
          ) : (
            <div className="flex justify-between mt-6">
              {!panoramaPreview ? (
                <Button onClick={generatePanorama} disabled={wallFiles.length < 2 || isUploading} className="w-full">
                  Generate 360° View
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={() => setShowViewer(true)} className="flex items-center flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View 360°
                  </Button>
                  <Button variant="secondary" onClick={openStandaloneViewer} className="flex items-center flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Fullscreen
                  </Button>
                </div>
              )}
            </div>
          )}

          {panoramaPreview && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold">360° View Preview</h2>
              <div className="overflow-hidden rounded-md border">
                <img src={panoramaPreview || "/placeholder.svg"} alt="360° Preview" className="w-full h-auto" />
              </div>
            </div>
          )}

          <Dialog open={showViewer} onOpenChange={setShowViewer}>
            <DialogContent className="max-w-5xl p-0 sm:max-w-[90vw] h-[80vh]">
              <div ref={viewerRef} className="w-full h-full relative" style={{ minHeight: "500px" }}></div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
