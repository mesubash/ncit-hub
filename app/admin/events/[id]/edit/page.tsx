"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { getEventById, updateEvent, deleteEvent, type Event } from "@/lib/events"
import { getCategories, type CategoryRow } from "@/lib/blog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Trash2, Calendar, MapPin, Clock, Users, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    event_date: "",
    event_time: "",
    end_date: "",
    end_time: "",
    location: "",
    max_participants: "",
    registration_deadline: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
  })
  
  const [isMultiDay, setIsMultiDay] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const [eventResult, categoriesResult] = await Promise.all([
        getEventById(params.id),
        getCategories(),
      ])

      if (eventResult.error || !eventResult.event) {
        toast({
          title: "❌ Error",
          description: "Failed to load event. Please try again.",
          variant: "destructive",
        })
        router.push("/admin/events")
        return
      }

      const eventData = eventResult.event
      setEvent(eventData)
      
      // Parse event date and time
      const eventDate = new Date(eventData.event_date)
      const endDate = eventData.end_date ? new Date(eventData.end_date) : null
      
      setFormData({
        title: eventData.title,
        description: eventData.description,
        category_id: eventData.category_id || "",
        event_date: eventDate.toISOString().split('T')[0],
        event_time: eventDate.toTimeString().slice(0, 5),
        end_date: endDate ? endDate.toISOString().split('T')[0] : "",
        end_time: endDate ? endDate.toTimeString().slice(0, 5) : "",
        location: eventData.location,
        max_participants: eventData.max_participants?.toString() || "",
        registration_deadline: eventData.registration_deadline 
          ? new Date(eventData.registration_deadline).toISOString().split('T')[0]
          : "",
        status: eventData.status,
      })
      
      setIsMultiDay(!!eventData.end_date && eventData.end_date !== eventData.event_date)

      if (!categoriesResult.error) {
        setCategories(categoriesResult.categories)
      }
    } catch (error) {
      console.error("Error loading event:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !event) return

    try {
      setIsSaving(true)

      // Validate dates
      if (isMultiDay && formData.end_date && formData.end_date < formData.event_date) {
        toast({
          title: "⚠️ Invalid Dates",
          description: "End date must be after or equal to start date.",
          variant: "destructive",
        })
        return
      }

      // Construct full datetime strings
      const eventDateTime = `${formData.event_date}T${formData.event_time}:00`
      const endDateTime = isMultiDay && formData.end_date && formData.end_time
        ? `${formData.end_date}T${formData.end_time}:00`
        : undefined

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        event_date: eventDateTime,
        end_date: endDateTime,
        location: formData.location.trim(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        registration_deadline: formData.registration_deadline || null,
        status: formData.status,
      }

      const { error } = await updateEvent(event.id, updateData)

      if (error) {
        toast({
          title: "❌ Error",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Event Updated",
          description: "Event has been updated successfully.",
        })
        router.push("/admin/events")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    
    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(true)
      const { error } = await deleteEvent(event.id)

      if (error) {
        toast({
          title: "❌ Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Event Deleted",
          description: `"${event.title}" has been deleted successfully.`,
        })
        router.push("/admin/events")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (!event) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <Button asChild>
              <Link href="/admin/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/admin/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Edit Event</h1>
                <p className="text-xl text-muted-foreground">Update your event details and settings.</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Update the basic information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category_id || "none"} 
                    onValueChange={(value) => handleInputChange("category_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Multi-day checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiday"
                    checked={isMultiDay}
                    onCheckedChange={(checked) => setIsMultiDay(checked as boolean)}
                  />
                  <Label htmlFor="multiday" className="cursor-pointer">
                    This is a multi-day event
                  </Label>
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Start Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="event_date"
                        type="date"
                        className="pl-10"
                        value={formData.event_date}
                        onChange={(e) => handleInputChange("event_date", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event_time">Start Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="event_time"
                        type="time"
                        className="pl-10"
                        value={formData.event_time}
                        onChange={(e) => handleInputChange("event_time", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* End Date and Time (if multi-day) */}
                {isMultiDay && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="end_date"
                          type="date"
                          className="pl-10"
                          value={formData.end_date}
                          onChange={(e) => handleInputChange("end_date", e.target.value)}
                          min={formData.event_date}
                          required={isMultiDay}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="end_time">End Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="end_time"
                          type="time"
                          className="pl-10"
                          value={formData.end_time}
                          onChange={(e) => handleInputChange("end_time", e.target.value)}
                          required={isMultiDay}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Event location..."
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <Label htmlFor="max_participants">Maximum Participants</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max_participants"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      className="pl-10"
                      value={formData.max_participants}
                      onChange={(e) => handleInputChange("max_participants", e.target.value)}
                      min="1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current participants: {event.current_participants}
                  </p>
                </div>

                {/* Registration Deadline */}
                <div>
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => handleInputChange("registration_deadline", e.target.value)}
                    max={formData.event_date}
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Event Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Event
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="bg-transparent"
                asChild
              >
                <Link href="/admin/events">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{event?.title}"</span>?
              <br />
              <br />
              This action cannot be undone. All event data, including {event?.current_participants || 0} registrations, will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  )
}
