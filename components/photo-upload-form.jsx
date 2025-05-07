"use client";

import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { uploadPhotos } from "../app/actions/upload-actions";
import { Upload, ImageIcon, Loader2 } from "lucide-react";

export default function PhotoUploadForm() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => {
        
        prev.forEach((url) => URL.revokeObjectURL(url));
        return newPreviews;
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadStatus("Please select at least one photo to upload.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading photos...");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("photos", file);
      });

      const result = await uploadPhotos(formData);

      if (result.success) {
        setUploadStatus("Photos uploaded successfully!");
        setFiles([]);
        setPreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button
                type="button"
                onClick={handleUploadClick}
                variant="outline"
                className="w-full h-32 border-dashed flex flex-col gap-2"
              >
                <Upload className="h-6 w-6" />
                <span>Click to select photos</span>
              </Button>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {uploadStatus && (
                <div
                  className={`mt-4 p-3 rounded-md w-full text-center ${
                    uploadStatus.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : uploadStatus.includes("Error") || uploadStatus.includes("error")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isUploading || files.length === 0} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Submit Photos
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
