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
import Link from "next/link"
import { Search, Calendar, Clock, MapPin, ArrowLeft, Users, Loader2, UserPlus, UserMinus, Flame } from "lucide-react"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [registrationLoading, setRegistrationLoading] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserRegistrations()
    }
  }, [user, events])

  const loadData = async () => {
    try {
      const [eventsResult, categoriesResult] = await Promise.all([getAllEvents(), getBlogCategories()])

      if (eventsResult.error) {
        console.error("Failed to load events:", eventsResult.error)
      } else {
        setEvents(eventsResult.events)
      }

      if (categoriesResult.error) {
        console.error("Failed to load categories:", categoriesResult.error)
      } else {
        setCategories(categoriesResult.categories)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserRegistrations = async () => {
    if (!user) return

    try {
      const registrations = await Promise.all(
        events.map(async (event) => {
          const { registered } = await isUserRegisteredForEvent(event.id, user.id)
          return registered ? event.id : null
        }),
      )
      setRegisteredEvents(registrations.filter(Boolean) as string[])
    } catch (error) {
      console.error("Failed to load user registrations:", error)
    }
  }

  const handleRegistration = async (eventId: string) => {
    if (!user) return

    setRegistrationLoading((prev) => [...prev, eventId])

    try {
      const isRegistered = registeredEvents.includes(eventId)

      if (isRegistered) {
        const { error } = await cancelEventRegistration(eventId, user.id)
        if (error) {
          console.error("Failed to cancel registration:", error)
        } else {
          setRegisteredEvents((prev) => prev.filter((id) => id !== eventId))
          // Update local event data
          setEvents((prev) =>
            prev.map((event) =>
              event.id === eventId ? { ...event, current_participants: event.current_participants - 1 } : event,
            ),
          )
        }
      } else {
        const { registration, error } = await registerForEvent(eventId, user.id)
        if (error) {
          console.error("Failed to register:", error)
        } else if (registration) {
          setRegisteredEvents((prev) => [...prev, eventId])
          // Update local event data
          setEvents((prev) =>
            prev.map((event) =>
              event.id === eventId ? { ...event, current_participants: event.current_participants + 1 } : event,
            ),
          )
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setRegistrationLoading((prev) => prev.filter((id) => id !== eventId))
    }
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
    
    // Filter by status: non-admins only see upcoming and completed events
    const isAdmin = user && user.role === "admin"
    const matchesStatus = isAdmin || event.status === "upcoming" || event.status === "completed"
    
    return matchesSearch && matchesCategory && matchesStatus
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

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
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

                  return (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
                    >
                      <CardHeader className="flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {event.category && (
                              <Badge variant="secondary" style={{ backgroundColor: event.category.color + "20" }}>
                                {event.category.name}
                              </Badge>
                            )}
                            <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
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
                        {event.organizer && (
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={event.organizer.avatar_url || undefined} />
                              <AvatarFallback>
                                {event.organizer.full_name
                                  ? event.organizer.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : "O"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {event.organizer.full_name || "Unknown Organizer"}
                              </p>
                              <p className="text-xs text-muted-foreground">Organizer</p>
                            </div>
                          </div>
                        )}

                        {/* Registration Button */}
                        {user && !isPastEvent && (
                          <Button
                            onClick={() => handleRegistration(event.id)}
                            disabled={isLoadingRegistration || (!isRegistered && isEventFull)}
                            variant={isRegistered ? "outline" : "default"}
                            size="sm"
                            className="w-full"
                          >
                            {isLoadingRegistration ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : isRegistered ? (
                              <UserMinus className="h-4 w-4 mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            {isLoadingRegistration
                              ? "Processing..."
                              : isRegistered
                                ? "Cancel Registration"
                                : isEventFull
                                  ? "Event Full"
                                  : "Register"}
                          </Button>
                        )}

                        {!user && !isPastEvent && (
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
