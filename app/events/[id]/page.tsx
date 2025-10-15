"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getEventById, registerForEvent, cancelEventRegistration, isUserRegisteredForEvent, deleteEvent, type Event } from "@/lib/events"
// TODO: Enable notifications later
// import { notifyEventRegistration } from "@/lib/notifications"
import { useAuth } from "@/contexts/auth-context"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Share2, 
  Loader2,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  useEffect(() => {
    if (event && user) {
      checkRegistration()
    }
  }, [event, user])

  const loadEvent = async () => {
    try {
      setIsLoading(true)
      const { event: fetchedEvent, error } = await getEventById(eventId)

      if (error || !fetchedEvent) {
        toast({
          title: "❌ Error",
          description: "Event not found.",
          variant: "destructive",
        })
        router.push("/events")
        return
      }

      setEvent(fetchedEvent)
    } catch (error) {
      console.error("Error loading event:", error)
      toast({
        title: "❌ Error",
        description: "Failed to load event.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!event || !user) return

    const { registered } = await isUserRegisteredForEvent(event.id, user.id)
    setIsRegistered(registered)
  }

  const handleRegistration = async () => {
    if (!user || !event) return

    setIsRegistering(true)

    try {
      if (isRegistered) {
        const { error } = await cancelEventRegistration(event.id, user.id)
        if (error) {
          toast({
            title: "❌ Error",
            description: "Failed to cancel registration.",
            variant: "destructive",
          })
        } else {
          setIsRegistered(false)
          setEvent(prev => prev ? { ...prev, current_participants: prev.current_participants - 1 } : null)
          toast({
            title: "✅ Registration Cancelled",
            description: "You have been removed from this event.",
          })
        }
      } else {
        const { registration, error } = await registerForEvent(event.id, user.id)
        if (error) {
          toast({
            title: "❌ Error",
            description: error,
            variant: "destructive",
          })
        } else if (registration) {
          setIsRegistered(true)
          setEvent(prev => prev ? { ...prev, current_participants: prev.current_participants + 1 } : null)
          
          // TODO: Enable notifications later
          // Send notification to user
          // await notifyEventRegistration(user.id, event.title, event.id, event.event_date)
          
          toast({
            title: "✅ Registered Successfully!",
            description: `You're registered for "${event.title}"`,
          })
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "✅ Link Copied",
        description: "Event link copied to clipboard!",
      })
    }
  }

  const handleDelete = async () => {
    if (!event) return

    setIsDeleting(true)

    try {
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
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isPastEvent = eventDate < new Date()
  const isEventFull = event.max_participants ? event.current_participants >= event.max_participants : false
  const isMultiDay = endDate && endDate.getTime() !== eventDate.getTime()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        {/* Admin Actions */}
        {user && user.role === 'admin' && (
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/events/${event.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        )}

        {/* Event Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {event.category && (
              <Badge variant="secondary" style={{ backgroundColor: event.category.color + "20" }}>
                {event.category.name}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={
                event.status === "upcoming"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  : event.status === "ongoing"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : event.status === "completed"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }
            >
              {event.status}
            </Badge>
            {isEventFull && <Badge variant="destructive">Full</Badge>}
            {isRegistered && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">{event.title}</h1>

          {/* Event Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {isMultiDay && endDate && (
                      <p className="text-sm text-muted-foreground">
                        to {endDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">
                      {eventDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPastEvent ? 'Event has ended' : 'Local time'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{event.location}</p>
                    <p className="text-sm text-muted-foreground">Event location</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">
                      {event.current_participants}
                      {event.max_participants && ` / ${event.max_participants}`} participants
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isEventFull ? 'Event is full' : 'Spots available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizer Info */}
          {event.organizer && (
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer.avatar_url || undefined} />
                  <AvatarFallback>
                    {event.organizer.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "O"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Organized by</p>
                  <p className="font-medium text-foreground">{event.organizer.full_name || "Unknown Organizer"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {user && !isPastEvent && (
                  <Button
                    onClick={handleRegistration}
                    disabled={isRegistering || (!isRegistered && isEventFull)}
                    variant={isRegistered ? "outline" : "default"}
                  >
                    {isRegistering ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : isRegistered ? (
                      <UserMinus className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isRegistering
                      ? "Processing..."
                      : isRegistered
                        ? "Cancel Registration"
                        : isEventFull
                          ? "Event Full"
                          : "Register"}
                  </Button>
                )}

                {!user && !isPastEvent && (
                  <Button variant="outline" asChild>
                    <Link href="/login">Login to Register</Link>
                  </Button>
                )}

                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        {/* Event Images */}
        {event.images && event.images.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${event.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            {event.images.length > 4 && (
              <p className="text-sm text-muted-foreground mt-2">+{event.images.length - 4} more images</p>
            )}
          </div>
        )}

        {/* Event Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About This Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap text-foreground">{event.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Deadline */}
        {event.registration_deadline && !isPastEvent && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Registration Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Badge variant="outline">
                  {new Date(event.registration_deadline) > new Date() ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </article>

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
              This action cannot be undone. All event data, including registrations, will be permanently removed.
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
    </div>
  )
}
