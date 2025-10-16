"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { User, Upload, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  userName: string
  onAvatarChange?: (url: string | null) => void
}

export function AvatarUpload({ currentAvatarUrl, userId, userName, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      setError("Image size must be less than 2MB")
      return
    }

    setError("")
    setIsUploading(true)

    try {
      const supabase = createClient()
      
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/").pop()
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${userId}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      
      if (onAvatarChange) {
        onAvatarChange(publicUrl)
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      setError(error.message || "Failed to upload avatar")
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    setIsUploading(true)
    try {
      const supabase = createClient()

      // Delete from storage
      const oldPath = avatarUrl.split("/").pop()
      if (oldPath) {
        await supabase.storage.from("avatars").remove([`${userId}/${oldPath}`])
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(null)
      
      if (onAvatarChange) {
        onAvatarChange(null)
      }

      toast({
        title: "Success",
        description: "Avatar removed successfully",
      })
    } catch (error: any) {
      console.error("Error removing avatar:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove avatar",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} alt={userName} />
          <AvatarFallback className="text-2xl">
            {userName ? getInitials(userName) : <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
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
                {avatarUrl ? "Change Avatar" : "Upload Avatar"}
              </>
            )}
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF (max. 2MB)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
