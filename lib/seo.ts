import type { Metadata } from "next"
import type { Blog } from "./blog"

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/og-image.png",
    url = "https://ncit-hub.vercel.app",
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
  } = config

  const fullTitle = title.includes("NCIT") ? title : `${title} | NCIT Hub`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : [{ name: "NCIT Hub Team" }],
    creator: "NCIT Hub",
    publisher: "Nepal College of Information Technology",

    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "NCIT Hub",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: type as any,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@ncit_hub",
      site: "@ncit_hub",
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Verification
    verification: {
      google: "your-google-verification-code",
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },
  }
}

export function generateBlogMetadata(blog: Blog, baseUrl = "https://ncit-hub.vercel.app"): Metadata {
  const url = `${baseUrl}/blogs/${blog.id}`
  const image = blog.images?.[0] || "/og-blog-default.png"

  return generateMetadata({
    title: blog.title,
    description: blog.excerpt,
    keywords: [...blog.tags, blog.category, "NCIT", "Nepal", "college", "blog"],
    image,
    url,
    type: "article",
    publishedTime: blog.publishedAt || blog.createdAt,
    modifiedTime: blog.updatedAt,
    author: blog.author,
    section: blog.category,
    tags: blog.tags,
  })
}

export function generateStructuredData(blog: Blog, baseUrl = "https://ncit-hub.vercel.app") {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.images?.[0] || "/og-blog-default.png",
    author: {
      "@type": "Person",
      name: blog.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nepal College of Information Technology",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/ncit-logo.png`,
      },
    },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/${blog.id}`,
    },
    keywords: blog.tags.join(", "),
    articleSection: blog.category,
    wordCount: blog.content.split(" ").length,
    url: `${baseUrl}/blogs/${blog.id}`,
  }
}
