"use client"

import { useEffect, useRef } from "react"
import { incrementBlogView } from "@/lib/blog"

interface BlogViewTrackerProps {
  blogId: string
}

export function BlogViewTracker({ blogId }: BlogViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per session
    const viewedBlogs = sessionStorage.getItem("viewed_blogs")
    const viewedBlogsArray = viewedBlogs ? JSON.parse(viewedBlogs) : []

    if (!hasTracked.current && !viewedBlogsArray.includes(blogId)) {
      // Increment view count
      incrementBlogView(blogId).then(({ success, error }) => {
        if (success) {
          // Mark as viewed in session storage
          viewedBlogsArray.push(blogId)
          sessionStorage.setItem("viewed_blogs", JSON.stringify(viewedBlogsArray))
          hasTracked.current = true
        } else {
          console.error("Failed to track blog view:", error)
        }
      })
    }
  }, [blogId])

  // This component doesn't render anything
  return null
}
