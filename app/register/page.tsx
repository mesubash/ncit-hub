"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { signUp, formatCollegeEmail } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const departments = [
  "Computer Engineering",
  "Electronics and Communication Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Architecture",
]

const semesters = [1, 2, 3, 4, 5, 6, 7, 8]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    year: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!formData.department || !formData.year) {
      setError("Department and Year are required")
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.department || undefined,
        formData.year ? Number.parseInt(formData.year) : undefined,
      )

      if (error) {
        // If it's a success message from email verification flow
        if (error.includes("Registration successful")) {
          router.push("/login?message=" + encodeURIComponent(error))
        } else {
          setError(error)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Create your NCIT account to start writing blogs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <div className="flex">
                  <Input
                    id="email"
                    type="text"
                    placeholder="username"
                    value={formData.email.split("@")[0] || ""}
                    onChange={(e) => handleInputChange("email", formatCollegeEmail(e.target.value))}
                    required
                  />
                  <div className="flex items-center bg-muted px-3 text-muted-foreground">
                    @ncit.edu.np
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Enter your NCIT username</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Required for better content filtering</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester.toString()}>
                        {semester}{semester === 1 ? "st" : semester === 2 ? "nd" : semester === 3 ? "rd" : "th"} Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Required for better content filtering</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
