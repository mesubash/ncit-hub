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
import { getEventById, registerForEvent, cancelEventRegistration, isUserRegisteredForEvent, deleteEvent, getEventParticipants, type Event } from "@/lib/events"
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

const isDev = process.env.NODE_ENV !== "production"
const devError = (...args: any[]) => { if (isDev) console.error(...args) }
import { useToast } from "@/hooks/use-toast"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { FEATURE_TOGGLE_KEYS } from "@/lib/feature-toggles"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    isEnabled: isEventManagementEnabled,
    isLoading: isEventToggleLoading,
  } = useFeatureToggle(FEATURE_TOGGLE_KEYS.EVENT_MANAGEMENT, { subscribe: true, defaultEnabled: false })

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  useEffect(() => {
    if (!isEventManagementEnabled) {
      setIsLoading(false)
      setEvent(null)
      return
    }
    loadEvent()
  }, [eventId, isEventManagementEnabled])

  useEffect(() => {
    if (event && user) {
      checkRegistration()
    }
  }, [event, user])

  const loadEvent = async () => {
    if (!isEventManagementEnabled) return
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
      
      // Load participants if user is admin
      if (user && user.role === 'admin') {
        await loadParticipants(eventId)
      }
    } catch (error) {
      devError("Error loading event:", error)
      toast({
        title: "❌ Error",
        description: "Failed to load event.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadParticipants = async (eventId: string) => {
    if (!isEventManagementEnabled) return
    try {
      setLoadingParticipants(true)
      const { participants: fetchedParticipants, error } = await getEventParticipants(eventId)
      
      if (error) {
        devError("Failed to load participants:", error)
      } else {
        setParticipants(fetchedParticipants)
      }
    } catch (error) {
      devError("Error loading participants:", error)
    } finally {
      setLoadingParticipants(false)
    }
  }

  const checkRegistration = async () => {
    if (!event || !user || !isEventManagementEnabled) return

    const { registered } = await isUserRegisteredForEvent(event.id, user.id)
    setIsRegistered(registered)
  }

  const handleRegistration = async () => {
    if (!user || !event || !isEventManagementEnabled) return

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
      devError("Registration error:", error)
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
    if (!event || !isEventManagementEnabled) return

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
      devError("Error deleting event:", error)
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

  if (!isEventToggleLoading && !isEventManagementEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Event details unavailable</CardTitle>
              <CardDescription>
                The event management system is currently disabled. Existing events are hidden until an admin turns it back on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
  
  // Check if event is at least 1 hour away for cancellation eligibility
  const currentTime = new Date()
  const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000)
  const canCancelRegistration = isRegistered && event.status === "upcoming" && eventDate > oneHourFromNow

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
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  {user && !isPastEvent && event.status !== "cancelled" && event.status !== "completed" && (
                    <Button
                      onClick={handleRegistration}
                      disabled={isRegistering || (!isRegistered && isEventFull) || (isRegistered && !canCancelRegistration)}
                      variant={isRegistered ? "outline" : "default"}
                    >
                      {isRegistering ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : isRegistered ? (
                        canCancelRegistration ? (
                          <UserMinus className="h-4 w-4 mr-2" />
                        ) : null
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {isRegistering
                        ? "Processing..."
                        : isRegistered
                          ? canCancelRegistration
                            ? "Cancel Registration"
                            : "Already Registered"
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
                {isRegistered && !canCancelRegistration && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Cancellation not available (event starts in less than 1 hour)
                  </p>
                )}
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

        {/* Participants List (Admin Only) */}
        {user && user.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Participants ({event.current_participants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading participants...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No participants yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to register!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={participant.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {participant.user.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{participant.user.full_name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{participant.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={participant.status === 'registered' ? 'default' : participant.status === 'attended' ? 'outline' : 'secondary'}>
                          {participant.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(participant.registration_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
