"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  isLiked: boolean
  likesCount: number
  onLike: () => Promise<void>
  onUnlike: () => Promise<void>
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function LikeButton({
  isLiked,
  likesCount,
  onLike,
  onUnlike,
  disabled = false,
  size = "md",
  showCount = true,
  className,
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked)
  const [optimisticCount, setOptimisticCount] = useState(likesCount)

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)

    // Optimistic update
    const newLiked = !optimisticLiked
    setOptimisticLiked(newLiked)
    setOptimisticCount(prev => prev + (newLiked ? 1 : -1))

    try {
      if (newLiked) {
        await onLike()
      } else {
        await onUnlike()
      }
    } catch (error) {
      // Revert on error
      setOptimisticLiked(!newLiked)
      setOptimisticCount(prev => prev + (newLiked ? -1 : 1))
      console.error("Error toggling like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Button
      variant={optimisticLiked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        "transition-all duration-200",
        optimisticLiked && "bg-red-500 hover:bg-red-600 text-white",
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          optimisticLiked && "fill-current"
        )}
      />
      {showCount && (
        <span className="ml-1.5 font-medium">
          {optimisticCount > 0 ? optimisticCount : ""}
        </span>
      )}
    </Button>
  )
}
