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
import { Loader2, ArrowLeft, CheckCircle2, X, GraduationCap, Briefcase, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Bachelor Engineering Programs
const bachelorEngineeringDepts = [
  "Computer Engineering",
  "Electronics and Communication Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Architecture",
  "Software Engineering",
  "Information Technology Engineering",
]

// Bachelor Business/Management Programs
const bachelorBusinessDepts = [
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Computer Applications (BCA)",
]

// Master's Programs
const mastersDepts = [
  "Computer Engineering",
  "Structural Engineering",
  "Construction Management",
  "Business Administration (MBA)",
  "Information Technology",
]

// Faculty Departments
const facultyDepts = [
  "Computer Engineering",
  "Electronics and Communication Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Architecture",
  "Software Engineering",
  "Information Technology",
  "Business Administration",
  "Mathematics",
  "Physics",
  "English",
  "Management",
]

const bachelorSemesters = [1, 2, 3, 4, 5, 6, 7, 8]
const mastersYears = [1, 2]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // student or faculty
    programType: "", // bachelor or master (for students only)
    department: "", // for students (single)
    departments: [] as string[], // for faculty (multiple)
    semester: "", // for bachelor students
    year: "", // for master students
    specialization: "", // for master students or faculty
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  // Determine user_type based on role and program type
  const getUserType = (): "bachelor_student" | "master_student" | "faculty" => {
    if (formData.role === "faculty") return "faculty"
    if (formData.role === "student" && formData.programType === "bachelor") return "bachelor_student"
    if (formData.role === "student" && formData.programType === "master") return "master_student"
    return "bachelor_student" // fallback
  }

  // Get available departments based on role and program type
  const getAvailableDepartments = () => {
    if (formData.role === "student" && formData.programType === "bachelor") {
      return [...bachelorEngineeringDepts, ...bachelorBusinessDepts]
    } else if (formData.role === "student" && formData.programType === "master") {
      return mastersDepts
    } else if (formData.role === "faculty") {
      return facultyDepts
    }
    return []
  }

  // Check if form is valid (all required fields filled)
  const isFormValid = () => {
    // Basic fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return false
    }

    // Role must be selected
    if (!formData.role) {
      return false
    }

    // For students
    if (formData.role === "student") {
      // Program type required
      if (!formData.programType) {
        return false
      }

      // Department required
      if (!formData.department) {
        return false
      }

      // Bachelor students need semester
      if (formData.programType === "bachelor" && !formData.semester) {
        return false
      }

      // Master students need year
      if (formData.programType === "master" && !formData.year) {
        return false
      }
    }

    // For faculty
    if (formData.role === "faculty") {
      // At least one department required
      if (formData.departments.length === 0) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!formData.role) {
      setError("Please select if you are a student or faculty member")
      return
    }

    if (formData.role === "student" && !formData.programType) {
      setError("Please select Bachelor's or Master's program")
      return
    }

    // Validation for students - single department
    if (formData.role === "student" && !formData.department) {
      setError("Department is required")
      return
    }

    // Validation for faculty - multiple departments
    if (formData.role === "faculty" && formData.departments.length === 0) {
      setError("Please select at least one department/expertise area")
      return
    }

    // Validation for bachelor students
    if (formData.role === "student" && formData.programType === "bachelor") {
      if (!formData.semester) {
        setError("Semester is required for bachelor students")
        return
      }
    }

    // Validation for master students
    if (formData.role === "student" && formData.programType === "master") {
      if (!formData.year) {
        setError("Year is required for master students")
        return
      }
    }

    setIsLoading(true)

    try {
      const userType = getUserType()
      
      // For faculty, join multiple departments with comma
      const departmentValue = formData.role === "faculty" 
        ? formData.departments.join(", ") 
        : formData.department
      
      const { user, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        userType,
        departmentValue,
        formData.programType as "bachelor" | "master" | undefined,
        formData.semester ? Number.parseInt(formData.semester) : undefined,
        formData.year ? Number.parseInt(formData.year) : undefined,
        formData.specialization || undefined,
      )

      if (error) {
        // Check for specific error codes
        if (error === "VERIFICATION_REQUIRED") {
          setSuccess(true)
          toast({
            title: "Registration Successful!",
            description: "Please check your email to verify your account before signing in.",
          })
          setTimeout(() => {
            router.push("/login?message=Please check your email to verify your account")
          }, 3000)
        } else if (error === "REGISTRATION_SUCCESS") {
          // Registration successful - redirect to login
          setSuccess(true)
          toast({
            title: "Registration Successful!",
            description: "Your account has been created. Please sign in to continue.",
          })
          setTimeout(() => {
            router.push("/login?message=Registration successful! Please sign in.")
          }, 2000)
        } else if (error === "PROFILE_CREATION_FAILED") {
          // Auth user created but profile failed - still allow login
          setSuccess(true)
          toast({
            title: "Registration Successful!",
            description: "Your account has been created. You can now sign in.",
          })
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else {
          // Actual error
          setError(error)
          toast({
            title: "Registration Failed",
            description: error,
            variant: "destructive",
          })
        }
      } else {
        // No error and no user returned - this means registration successful
        setSuccess(true)
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please sign in to continue.",
        })
        setTimeout(() => {
          router.push("/login?message=Registration successful! Please sign in.")
        }, 2000)
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred"
      setError(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle adding a department for faculty
  const handleAddDepartment = (dept: string) => {
    if (!formData.departments.includes(dept)) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, dept]
      }))
    }
  }

  // Handle removing a department for faculty
  const handleRemoveDepartment = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.filter(d => d !== dept)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container max-w-2xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">Join NCIT Hub community today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Registration successful! Please check your email to verify your account. Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name and Email */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">College Email *</Label>
                  <div className="flex">
                    <Input
                      id="email"
                      type="text"
                      placeholder="username"
                      value={formData.email.split("@")[0] || ""}
                      onChange={(e) => handleInputChange("email", formatCollegeEmail(e.target.value))}
                      required
                      className="h-11 rounded-r-none"
                    />
                    <div className="flex items-center bg-muted px-3 text-sm text-muted-foreground border border-l-0 rounded-r-md">
                      @ncit.edu.np
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">I am a *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => {
                    handleInputChange("role", value)
                    // Reset dependent fields when role changes
                    handleInputChange("programType", "")
                    handleInputChange("department", "")
                    setFormData(prev => ({ ...prev, departments: [] }))
                    handleInputChange("semester", "")
                    handleInputChange("year", "")
                    handleInputChange("specialization", "")
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Faculty Member</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Program Type for Students */}
              {formData.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="programType">Program Level *</Label>
                  <Select 
                    value={formData.programType} 
                    onValueChange={(value) => {
                      handleInputChange("programType", value)
                      handleInputChange("department", "")
                      handleInputChange("semester", "")
                      handleInputChange("year", "")
                      handleInputChange("specialization", "")
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select program level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's Program (4 Years)</SelectItem>
                      <SelectItem value="master">Master's Program (2 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Department/Expertise Selection */}
              {(formData.role === "faculty" || (formData.role === "student" && formData.programType)) && (
                <>
                  {/* Single Department for Students */}
                  {formData.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Department/Program *</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableDepartments().map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Multiple Departments for Faculty */}
                  {formData.role === "faculty" && (
                    <div className="space-y-3">
                      <Label htmlFor="departments">Departments/Expertise Areas *</Label>
                      <p className="text-sm text-muted-foreground">Select all departments you are associated with</p>
                      
                      {/* Selected Departments Display */}
                      {formData.departments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
                          {formData.departments.map((dept) => (
                            <Badge 
                              key={dept} 
                              variant="secondary" 
                              className="px-3 py-1.5 text-sm flex items-center gap-2"
                            >
                              {dept}
                              <button
                                type="button"
                                onClick={() => handleRemoveDepartment(dept)}
                                className="hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Department Selection Dropdown */}
                      <Select 
                        onValueChange={handleAddDepartment}
                        value=""
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Add a department or expertise area" />
                        </SelectTrigger>
                        <SelectContent>
                          {facultyDepts
                            .filter(dept => !formData.departments.includes(dept))
                            .map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {formData.departments.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No departments selected yet. Please add at least one.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Semester for Bachelor Students */}
                  {formData.role === "student" && formData.programType === "bachelor" && (
                    <div className="space-y-2">
                      <Label htmlFor="semester">Current Semester *</Label>
                      <Select 
                        value={formData.semester} 
                        onValueChange={(value) => handleInputChange("semester", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {bachelorSemesters.map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              {sem}{sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th"} Semester
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Year and Specialization for Master Students */}
                  {formData.role === "student" && formData.programType === "master" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="year">Current Year *</Label>
                        <Select 
                          value={formData.year} 
                          onValueChange={(value) => handleInputChange("year", value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                          <SelectContent>
                            {mastersYears.map((yr) => (
                              <SelectItem key={yr} value={yr.toString()}>
                                {yr}{yr === 1 ? "st" : "nd"} Year
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization (Optional)</Label>
                        <Input
                          id="specialization"
                          type="text"
                          placeholder="e.g., Machine Learning, Data Science"
                          value={formData.specialization}
                          onChange={(e) => handleInputChange("specialization", e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </>
                  )}

                  {/* Area of Expertise for Faculty */}
                  {formData.role === "faculty" && (
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Research/Teaching Focus (Optional)</Label>
                      <Input
                        id="specialization"
                        type="text"
                        placeholder="e.g., Artificial Intelligence, Structural Analysis"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">Your primary area of research or teaching interest</p>
                    </div>
                  )}
                </>
              )}

              {/* Password Fields */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading || !isFormValid()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
