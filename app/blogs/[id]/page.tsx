import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SEOHead } from "@/components/seo-head"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Share2, BookmarkPlus, Heart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { getBlogById, getAllBlogs } from "@/lib/blog"
import { generateBlogMetadata, generateStructuredData } from "@/lib/seo"
import { notFound } from "next/navigation"

interface BlogPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { blog, error } = await getBlogById(params.id)

  if (error || !blog) {
    return {
      title: "Blog Not Found | NCIT Hub",
      description: "The requested blog post could not be found.",
    }
  }

  return generateBlogMetadata(blog)
}

export async function generateStaticParams() {
  const { blogs } = await getAllBlogs("published")

  return blogs.map((blog) => ({
    id: blog.id,
  }))
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { blog, error } = await getBlogById(params.id)

  if (error || !blog || blog.status !== "published") {
    notFound()
  }

  const structuredData = generateStructuredData(blog)

  return (
    <>
      <SEOHead structuredData={structuredData} />
      <div className="min-h-screen bg-background">
        <Navigation />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/blogs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Link>
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{blog.category?.name || "Uncategorized"}</Badge>
              <span className="text-sm text-muted-foreground">
                {Math.ceil(blog.content.split(" ").length / 200)} min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{blog.title}</h1>

            <p className="text-xl text-muted-foreground mb-6 text-pretty">{blog.excerpt}</p>

            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {blog.author?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{blog.author?.full_name || "Anonymous"}</p>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.ceil(blog.content.split(" ").length / 200)} min read
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {blog.views > 50 ? Math.floor(blog.views / 10) : 0}
                </Button>
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <Separator className="mb-8" />

          {/* Blog Images */}
          {blog.images && blog.images.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blog.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${blog.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              {blog.images.length > 4 && (
                <p className="text-sm text-muted-foreground mt-2">+{blog.images.length - 4} more images</p>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {blog.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Article Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-8">
            <div className="flex items-center space-x-4">
              <span>{blog.views} views</span>
              <span>{Math.floor(blog.views / 10)} likes</span>
            </div>
            <div>Published on {new Date(blog.published_at || blog.created_at).toLocaleDateString()}</div>
          </div>
        </article>
      </div>
    </>
  )
}
