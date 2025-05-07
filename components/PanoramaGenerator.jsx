"use client"

import React, { useState, useRef } from "react";
import { Upload, X, Info, Camera, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useToast } from "../app/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const PanoramaGenerator = ({ conventionCenterId, conventionCenterName, onPanoramaCreated }) => {
  const [wallFiles, setWallFiles] = useState([]);
  const [ceilingFile, setCeilingFile] = useState(null);
  const [floorFile, setFloorFile] = useState(null);
  const [wallPreviews, setWallPreviews] = useState([]);
  const [ceilingPreview, setCeilingPreview] = useState(null);
  const [floorPreview, setFloorPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [panoramaPreview, setPanoramaPreview] = useState(null);
  const [panoramaName, setPanoramaName] = useState(`${conventionCenterName} - 360° View`);
  const [panoramaDescription, setPanoramaDescription] = useState("");
  const { toast } = useToast();

  const handleWallFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setWallFiles((prev) => [...prev, ...selectedFiles]);

      
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setWallPreviews((prev) => [...prev, e.target.result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCeilingFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCeilingFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCeilingPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFloorFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFloorFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFloorPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeWallFile = (index) => {
    setWallFiles(wallFiles.filter((_, i) => i !== index));
    setWallPreviews(wallPreviews.filter((_, i) => i !== index));
  };

  const removeCeilingFile = () => {
    setCeilingFile(null);
    setCeilingPreview(null);
  };

  const removeFloorFile = () => {
    setFloorFile(null);
    setFloorPreview(null);
  };

  const generatePanorama = async () => {
    if (wallFiles.length < 2) {
      toast({
        title: "Not enough wall images",
        description: "Please upload at least 2 wall images to create a 360° view",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      
      const panoramaImage = await createSimplePanorama(wallPreviews, ceilingPreview, floorPreview);
      setProgress(100);
      setPanoramaPreview(panoramaImage);
      setIsUploading(false);

      toast({
        title: "Success!",
        description: "Your 360° spatial view has been generated. You can now view or submit it.",
        variant: "default",
      });
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create panorama",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!panoramaPreview) {
      toast({
        title: "Missing panorama",
        description: "Please generate a 360° view first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      
      const response = await fetch("/api/panoramas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conventionCenterId,
          panorama: {
            name: panoramaName,
            description: panoramaDescription,
            panoramaImage: panoramaPreview,
            wallImages: wallPreviews,
            ceilingImage: ceilingPreview,
            floorImage: floorPreview,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save panorama");
      }

      const data = await response.json();
      setProgress(100);

      toast({
        title: "Success!",
        description: "Your 360° spatial view has been saved successfully",
        variant: "default",
      });

      setIsUploading(false);
      
      
      if (onPanoramaCreated) {
        onPanoramaCreated(data.panorama);
      }
      
      
      setWallFiles([]);
      setCeilingFile(null);
      setFloorFile(null);
      setWallPreviews([]);
      setCeilingPreview(null);
      setFloorPreview(null);
      setPanoramaPreview(null);
      setPanoramaName(`${conventionCenterName} - 360° View`);
      setPanoramaDescription("");
      
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save panorama",
        variant: "destructive",
      });
    }
  };

  const openStandaloneViewer = () => {
    if (!panoramaPreview) {
      toast({
        title: "Missing panorama",
        description: "Please generate a 360° view first",
        variant: "destructive",
      });
      return;
    }

  
    const viewerWindow = window.open("", "_blank");

    if (!viewerWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to open the 360° viewer",
        variant: "destructive",
      });
      return;
    }

    
    viewerWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${panoramaName} - 360° Panorama Viewer</title>
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
    `);

    viewerWindow.document.close();
  };


  const createSimplePanorama = async (
    wallImages,
    ceilingImage,
    floorImage,
  ) => {
    return new Promise((resolve, reject) => {
      try {
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        
        const timeout = setTimeout(() => {
          reject(new Error("Panorama creation timed out"));
        }, 30000); 

        canvas.width = 4096;
        canvas.height = 2048;

      
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setProgress(20);

        const loadImage = (src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.src = src;
          });
        };

        Promise.all(wallImages.map((src) => loadImage(src)))
          .then((images) => {
            setProgress(50);

            const segmentWidth = canvas.width / images.length;

            images.forEach((img, i) => {
              const x = i * segmentWidth;
              const y = canvas.height / 4; 
              const height = canvas.height / 2; 

              ctx.drawImage(img, x, y, segmentWidth, height);
            });

            setProgress(80);

            const processCeilingAndFloor = async () => {
              if (ceilingImage) {
                try {
                  const ceilingImg = await loadImage(ceilingImage);
                  ctx.drawImage(ceilingImg, 0, 0, canvas.width, canvas.height / 4);
                } catch (e) {
                  console.error("Error loading ceiling image:", e);
                }
              }

              if (floorImage) {
                try {
                  const floorImg = await loadImage(floorImage);
                  ctx.drawImage(floorImg, 0, (canvas.height * 3) / 4, canvas.width, canvas.height / 4);
                } catch (e) {
                  console.error("Error loading floor image:", e);
                }
              }

              clearTimeout(timeout);

              const panoramaDataUrl = canvas.toDataURL("image/jpeg", 0.9);
              resolve(panoramaDataUrl);
            };

            processCeilingAndFloor();
          })
          .catch((err) => {
            clearTimeout(timeout);
            console.error("Error creating panorama:", err);
            reject(err);
          });
      } catch (error) {
        console.error("Exception in panorama creation:", error);
        reject(error);
      }
    });
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6 text-2xl font-bold">Create 360° View</h2>

        <div className="mb-4 space-y-2">
          <div>
            <label htmlFor="panorama-name" className="block text-sm font-medium mb-1">
              Panorama Name
            </label>
            <input
              id="panorama-name"
              type="text"
              value={panoramaName}
              onChange={(e) => setPanoramaName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a name for this 360° view"
            />
          </div>
          <div>
            <label htmlFor="panorama-description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              id="panorama-description"
              value={panoramaDescription}
              onChange={(e) => setPanoramaDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a description for this 360° view"
              rows={2}
            />
          </div>
        </div>

        <Tabs defaultValue="walls" className="mb-8">
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
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="mb-4 text-muted-foreground">For best results, follow these guidelines:</p>
                  <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                    <li>Take photos of your convention center walls in sequence, moving in a complete circle</li>
                    <li>Each photo should overlap with the previous one by about 30%</li>
                    <li>Keep the camera at the same height and distance from walls for all photos</li>
                    <li>Try to maintain consistent lighting across all photos</li>
                    <li>Upload the photos in clockwise or counter-clockwise order</li>
                  </ul>
                </div>

                <label htmlFor="wall-upload" className="block w-full">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
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
                    <h2 className="mb-4 text-xl font-semibold">Wall Photos ({wallPreviews.length})</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {wallPreviews.map((preview, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative group">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Wall Preview ${index + 1}`}
                                className="object-cover w-full aspect-square"
                              />
                              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => removeWallFile(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="absolute px-2 py-1 text-xs font-medium text-white bg-black/60 top-2 left-2">
                                {index + 1}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ceiling" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="mb-4 text-muted-foreground">For the best ceiling view:</p>
                  <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                    <li>Stand in the center of the convention center and point your camera directly upward</li>
                    <li>Try to capture the entire ceiling in a single shot</li>
                    <li>Ensure good lighting to capture ceiling details</li>
                  </ul>
                </div>

                <label htmlFor="ceiling-upload" className="block w-full">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <ArrowUp className="w-12 h-12 mb-4 text-muted-foreground" />
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
                    <h2 className="mb-4 text-xl font-semibold">Ceiling Photo</h2>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative group">
                          <img
                            src={ceilingPreview || "/placeholder.svg"}
                            alt="Ceiling Preview"
                            className="object-cover w-full aspect-square"
                          />
                          <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                            <Button variant="destructive" size="icon" className="w-8 h-8" onClick={removeCeilingFile}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="floor" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="mb-4 text-muted-foreground">For the best floor view:</p>
                  <ul className="pl-5 mb-6 space-y-2 list-disc text-muted-foreground">
                    <li>Stand in the center of the convention center and point your camera directly downward</li>
                    <li>Try to capture the entire floor in a single shot</li>
                    <li>Ensure good lighting to capture floor details</li>
                  </ul>
                </div>

                <label htmlFor="floor-upload" className="block w-full">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <ArrowDown className="w-12 h-12 mb-4 text-muted-foreground" />
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
                    <h2 className="mb-4 text-xl font-semibold">Floor Photo</h2>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative group">
                          <img
                            src={floorPreview || "/placeholder.svg"}
                            alt="Floor Preview"
                            className="object-cover w-full aspect-square"
                          />
                          <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                            <Button variant="destructive" size="icon" className="w-8 h-8" onClick={removeFloorFile}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
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
          <div className="flex justify-between">
            {!panoramaPreview ? (
              <Button onClick={generatePanorama} disabled={wallFiles.length < 2 || isUploading} className="px-6">
                Generate 360° View
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={openStandaloneViewer} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View 360° (Fullscreen)
                </Button>
                <Button onClick={handleSubmit} className="px-6">
                  Submit
                </Button>
              </div>
            )}
          </div>
        )}

        {panoramaPreview && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">360° View Preview</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img src={panoramaPreview || "/placeholder.svg"} alt="360° Preview" className="w-full h-auto" />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanoramaGenerator;