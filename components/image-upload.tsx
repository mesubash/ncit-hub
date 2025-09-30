"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxSizePerImage?: number // in MB
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, maxSizePerImage = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setError("")
    setIsUploading(true)

    try {
      // Check if adding these files would exceed the limit
      if (images.length + files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`)
        return
      }

      const newImages: string[] = []

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not a valid image file`)
          continue
        }

        // Validate file size
        if (file.size > maxSizePerImage * 1024 * 1024) {
          setError(`${file.name} is too large. Maximum size is ${maxSizePerImage}MB`)
          continue
        }

        // Convert to base64 for mock storage (in real app, upload to cloud storage)
        const base64 = await fileToBase64(file)
        newImages.push(base64)
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } catch (err) {
      setError("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          Images ({images.length}/{maxImages})
        </Label>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      {images.length === 0 && (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">Click to upload images or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG, GIF up to {maxSizePerImage}MB each (max {maxImages} images)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Add more button */}
          {canAddMore && (
            <Card
              className="aspect-square border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Add More</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Images will be displayed in your blog post. You can reorder them by removing and re-adding.
      </p>
    </div>
  )
}
