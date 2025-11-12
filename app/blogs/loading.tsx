"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <span
          className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-label="Loading blogs"
        />
        <p className="text-muted-foreground">Loading blogs...</p>
      </div>
    </div>
  )
}
