"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  getAllEvents,
  registerForEvent,
  cancelEventRegistration,
  isUserRegisteredForEvent,
  type Event,
} from "@/lib/events"
import { getCategories as getBlogCategories, type CategoryRow, stripMarkdown } from "@/lib/blog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Search, Calendar, Clock, MapPin, ArrowLeft, Users, Loader2, UserPlus, UserMinus, Flame, AlertTriangle } from "lucide-react"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { FEATURE_TOGGLE_KEYS } from "@/lib/feature-toggles"

const isDev = process.env.NODE_ENV !== "production"
const devLog = (...args: any[]) => { if (isDev) console.log(...args) }
const devError = (...args: any[]) => { if (isDev) console.error(...args) }

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("upcoming") // Default to upcoming
  const [showOnlyMyParticipations, setShowOnlyMyParticipations] = useState(false)
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [registrationLoading, setRegistrationLoading] = useState<string[]>([])
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    isEnabled: isEventManagementEnabled,
    isLoading: isEventToggleLoading,
  } = useFeatureToggle(FEATURE_TOGGLE_KEYS.EVENT_MANAGEMENT, { subscribe: true, defaultEnabled: false })

  useEffect(() => {
    if (!isEventManagementEnabled) {
      setEvents([])
      setIsLoading(false)
      return
    }
    loadData()
  }, [isEventManagementEnabled])

  useEffect(() => {
    if (user && isEventManagementEnabled) {
      loadUserRegistrations()
    }
  }, [user, events, isEventManagementEnabled])

  const loadData = async () => {
    try {
      const [eventsResult, categoriesResult] = await Promise.all([getAllEvents(), getBlogCategories()])

      if (eventsResult.error) {
        devError("Failed to load events:", eventsResult.error)
      } else {
        setEvents(eventsResult.events)
        // Load user registrations with the fresh events data
        if (user) {
          await loadUserRegistrations(eventsResult.events)
        }
      }

      if (categoriesResult.error) {
        devError("Failed to load categories:", categoriesResult.error)
      } else {
        setCategories(categoriesResult.categories)
      }
    } catch (error) {
      devError("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserRegistrations = async (eventsList?: Event[]) => {
    if (!user || !isEventManagementEnabled) return

    // Use provided events list or fallback to state
    const eventsToCheck = eventsList || events
    if (eventsToCheck.length === 0) return

    try {
      const registrations = await Promise.all(
        eventsToCheck.map(async (event) => {
          const { registered } = await isUserRegisteredForEvent(event.id, user.id)
          return registered ? event.id : null
        }),
      )
      setRegisteredEvents(registrations.filter(Boolean) as string[])
      devLog("🔄 User registrations reloaded:", registrations.filter(Boolean))
    } catch (error) {
      devError("Failed to load user registrations:", error)
    }
  }

  const handleRegistration = async (eventId: string) => {
    if (!user || !isEventManagementEnabled) return

    setRegistrationLoading((prev) => [...prev, eventId])

    try {
      const isRegistered = registeredEvents.includes(eventId)
      devLog(`🔍 Event ${eventId}: isRegistered = ${isRegistered}, user = ${user.id}`)

      if (isRegistered) {
        // Cancel registration
        devLog(`🔄 Attempting to cancel registration for event ${eventId}...`)
        const { error } = await cancelEventRegistration(eventId, user.id)
        if (error) {
          devError("❌ Failed to cancel registration:", error)
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
        } else {
          // Show success message
          toast({
            title: "Registration Cancelled",
            description: "You have successfully cancelled your registration.",
          })
          
          // Reload event data AND user registrations (loadData now handles both)
          devLog("✅ Registration cancelled, reloading data...")
          await loadData()
        }
      } else {
        // Register for event
        devLog(`🔄 Attempting to register for event ${eventId}...`)
        const { registration, error } = await registerForEvent(eventId, user.id)
        if (error) {
          devError("❌ Failed to register:", error)
          toast({
            title: "Registration Failed",
            description: error,
            variant: "destructive",
          })
        } else if (registration) {
          // Show success message
          toast({
            title: "Registration Successful",
            description: "You have successfully registered for this event!",
          })
          
          // Reload event data AND user registrations (loadData now handles both)
          devLog("✅ Registration successful, reloading data...")
          await loadData()
        }
      }
    } catch (error) {
      devError("❌ Registration error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRegistrationLoading((prev) => prev.filter((id) => id !== eventId))
    }
  }

  if (!isEventToggleLoading && !isEventManagementEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Events are temporarily unavailable</CardTitle>
              <CardDescription>
                The event management system has been turned off by the administrators. Please check back later for new updates.
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" ||
      (event.category && event.category.name === selectedCategory) ||
      (!event.category && selectedCategory === "Uncategorized")
    
    // Filter by selected status
    const matchesStatusFilter = selectedStatus === "all" || event.status === selectedStatus
    
    // Admin can see all statuses, non-admin only see upcoming and completed
    const isAdmin = user && user.role === "admin"
    const allowedByRole = isAdmin || event.status === "upcoming" || event.status === "completed"
    
    // Filter by user's participations
    const matchesParticipationFilter = !showOnlyMyParticipations || registeredEvents.includes(event.id)
    
    return matchesSearch && matchesCategory && matchesStatusFilter && allowedByRole && matchesParticipationFilter
  }).sort((a, b) => {
    // Sort order: upcoming first, then completed, then others
    const statusOrder = { upcoming: 1, completed: 2, ongoing: 3, cancelled: 4, postponed: 5, draft: 6 }
    const aOrder = statusOrder[a.status] || 99
    const bOrder = statusOrder[b.status] || 99
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }
    
    // Within same status, sort by date (upcoming events: soonest first, completed: most recent first)
    const aDate = new Date(a.event_date).getTime()
    const bDate = new Date(b.event_date).getTime()
    
    if (a.status === "upcoming") {
      return aDate - bDate // Soonest first
    } else {
      return bDate - aDate // Most recent first
    }
  })

  const upcomingEvents = events.filter((event) => new Date(event.event_date) > new Date()).slice(0, 3)

  const allCategories = ["All", ...categories.map((cat) => cat.name), "Uncategorized"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            {/* Admin buttons */}
            {user && user.role === 'admin' && (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/admin/events">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage Events
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  <Link href="/admin/events/new">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Event
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">College Events</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover upcoming events, workshops, and activities happening on campus.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <Button
                      key={category}
                      variant={category === selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedStatus === "upcoming" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus("upcoming")}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={selectedStatus === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus("completed")}
                  >
                    Completed
                  </Button>
                  {user && user.role === "admin" && (
                    <>
                      <Button
                        variant={selectedStatus === "ongoing" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("ongoing")}
                      >
                        Ongoing
                      </Button>
                      <Button
                        variant={selectedStatus === "cancelled" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("cancelled")}
                      >
                        Cancelled
                      </Button>
                      <Button
                        variant={selectedStatus === "draft" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("draft")}
                      >
                        Draft
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* My Participations Filter - Only show for logged in users */}
              {user && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Participation</p>
                  <Button
                    variant={showOnlyMyParticipations ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyMyParticipations(!showOnlyMyParticipations)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    My Participations
                    {showOnlyMyParticipations && ` (${registeredEvents.length})`}
                  </Button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedStatus !== "all" && ` • ${selectedStatus}`}
                {showOnlyMyParticipations && ` • My Participations`}
              </p>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== "All"
                      ? "Try adjusting your search or filter criteria."
                      : "No events available yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredEvents.map((event) => {
                  const isRegistered = registeredEvents.includes(event.id)
                  const isLoadingRegistration = registrationLoading.includes(event.id)
                  const eventDate = new Date(event.event_date)
                  const isPastEvent = eventDate < new Date()
                  const isEventFull = !!(event.max_participants && event.current_participants >= event.max_participants)
                  const isUpcoming = event.status === "upcoming"
                  const isHot = isUpcoming && !isPastEvent
                  
                  // Check if event is at least 1 hour away
                  const currentTime = new Date()
                  const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000)
                  const canCancelRegistration = isRegistered && isUpcoming && eventDate > oneHourFromNow

                  return (
                    <Card
                      key={event.id}
                      className={`hover:shadow-lg transition-all duration-300 h-full flex flex-col group ${
                        isHot ? "border-2 border-orange-500 shadow-orange-100 dark:shadow-orange-900/20" : ""
                      }`}
                    >
                      <CardHeader className="flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {event.category && (
                              <Badge variant="secondary" style={{ backgroundColor: event.category.color + "20" }}>
                                {event.category.name}
                              </Badge>
                            )}
                            {isHot && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                                <Flame className="h-3 w-3 mr-1" />
                                Hot Event
                              </Badge>
                            )}
                            <Badge variant={event.status === "upcoming" ? "default" : event.status === "completed" ? "secondary" : "outline"}>
                              {event.status}
                            </Badge>
                            {isEventFull && <Badge variant="destructive">Full</Badge>}
                          </div>
                        </div>
                        <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
                          <Link href={`/events/${event.id}`}>{event.title}</Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between">
                        <CardDescription className="mb-4 line-clamp-3 flex-grow">
                          {stripMarkdown(event.description)}
                        </CardDescription>

                        {/* Event Details */}
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {eventDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {eventDate.toLocaleTimeString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {event.current_participants}
                            {event.max_participants && ` / ${event.max_participants}`} participants
                          </div>
                        </div>

                        {/* Organizer Info */}
                        {(event.organizer_name || event.organizer) && (
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={event.organizer?.avatar_url || undefined} />
                              <AvatarFallback>
                                {event.organizer_name 
                                  ? event.organizer_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                  : event.organizer?.full_name
                                  ? event.organizer.full_name.split(" ").map((n) => n[0]).join("")
                                  : "O"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {event.organizer_name || event.organizer?.full_name || "Unknown Organizer"}
                              </p>
                              <p className="text-xs text-muted-foreground">Organizer</p>
                            </div>
                          </div>
                        )}

                        {/* Registration Button */}
                        {user && !isPastEvent && event.status !== "cancelled" && event.status !== "completed" && (
                          <>
                            <Button
                              onClick={() => handleRegistration(event.id)}
                              disabled={isLoadingRegistration || (!isRegistered && isEventFull) || (isRegistered && !canCancelRegistration)}
                              variant={isRegistered ? "outline" : "default"}
                              size="sm"
                              className={`w-full ${
                                isHot && !isRegistered 
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" 
                                  : ""
                              }`}
                            >
                              {isLoadingRegistration ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : isRegistered ? (
                                canCancelRegistration ? (
                                  <UserMinus className="h-4 w-4 mr-2" />
                                ) : null
                              ) : (
                                <UserPlus className="h-4 w-4 mr-2" />
                              )}
                              {isLoadingRegistration
                                ? "Processing..."
                                : isRegistered
                                  ? canCancelRegistration
                                    ? "Cancel Registration"
                                    : "Already Registered"
                                  : isEventFull
                                    ? "Event Full"
                                    : "I Will Participate"}
                            </Button>
                            {isRegistered && !canCancelRegistration && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Cancellation not available (event starts in less than 1 hour)
                              </p>
                            )}
                          </>
                        )}

                        {!user && !isPastEvent && event.status !== "cancelled" && event.status !== "completed" && (
                          <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                            <Link href="/login">Login to Register</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription>Don't miss these events</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <Link href={`/events/${event.id}`} className="group">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                            {event.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-2">
                              <Users className="h-3 w-3" />
                              <span>{event.current_participants}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Browse by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allCategories.slice(1).map((category) => {
                      const count = events.filter((event) => {
                        if (category === "Uncategorized") return !event.category
                        return event.category?.name === category
                      }).length
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between ${
                            selectedCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <span>{category}</span>
                          <span className="text-xs opacity-70">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
