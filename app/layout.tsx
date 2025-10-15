import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { SEOHead } from "@/components/seo-head"
import { Toaster } from "@/components/ui/toaster"
import { generateMetadata } from "@/lib/seo"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Added font display swap for better performance
})

export const metadata: Metadata = generateMetadata({
  title: "NCIT Hub - College Blog & Events Platform",
  description:
    "Stay connected with Nepal College of Information Technology (NCIT) through our comprehensive blog and events platform. Share experiences, discover opportunities, and engage with the NCIT community.",
  keywords: [
    "NCIT",
    "Nepal College of Information Technology",
    "college blog",
    "student life",
    "campus events",
    "Nepal education",
    "technology",
    "computer science",
    "engineering",
    "student community",
  ],
  url: "https://ncit-hub.vercel.app",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <SEOHead />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" storageKey="college-hub-theme">
          <AuthProvider>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>{children}</Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
