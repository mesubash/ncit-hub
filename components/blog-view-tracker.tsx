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

    console.log("🔍 BlogViewTracker - Checking if blog viewed:", {
      blogId,
      alreadyViewed: viewedBlogsArray.includes(blogId),
      viewedBlogs: viewedBlogsArray
    })

    if (!hasTracked.current && !viewedBlogsArray.includes(blogId)) {
      console.log("📊 Tracking view for blog:", blogId)
      
      // Increment view count
      incrementBlogView(blogId).then(({ success, error }) => {
        if (success) {
          console.log("✅ Blog view tracked successfully!")
          // Mark as viewed in session storage
          viewedBlogsArray.push(blogId)
          sessionStorage.setItem("viewed_blogs", JSON.stringify(viewedBlogsArray))
          hasTracked.current = true
        } else {
          console.error("❌ Failed to track blog view:", error)
        }
      })
    } else {
      console.log("⏭️ Skipping view tracking (already tracked this session)")
    }
  }, [blogId])

  // This component doesn't render anything
  return null
}
