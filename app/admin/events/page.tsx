"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
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
import { getAllEvents, deleteEvent, type Event } from "@/lib/events"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, Calendar, Loader2, Users, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { FEATURE_TOGGLE_KEYS } from "@/lib/feature-toggles"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null)
  const { toast } = useToast()
  const {
    isEnabled: isEventManagementEnabled,
    isLoading: isEventToggleLoading,
  } = useFeatureToggle(FEATURE_TOGGLE_KEYS.EVENT_MANAGEMENT, { subscribe: true })

  useEffect(() => {
    if (!isEventManagementEnabled) {
      setEvents([])
      setIsLoading(false)
      return
    }
    loadEvents()
  }, [isEventManagementEnabled])

  const loadEvents = async () => {
    if (!isEventManagementEnabled) return
    try {
      setIsLoading(true)
      const { events: fetchedEvents, error } = await getAllEvents()
      
      if (error) {
        console.error("Failed to load events:", error)
        toast({
          title: "❌ Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        })
      } else {
        setEvents(fetchedEvents)
      }
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete || !isEventManagementEnabled) return

    try {
      setDeletingId(eventToDelete.id)
      const { error } = await deleteEvent(eventToDelete.id)
      
      if (error) {
        toast({
          title: "❌ Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Event Deleted",
          description: `"${eventToDelete.title}" has been deleted successfully.`,
        })
        // Remove from local state
        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id))
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setShowDeleteDialog(false)
      setEventToDelete(null)
    }
  }

  if (!isEventToggleLoading && !isEventManagementEnabled) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="text-center">
              <CardHeader className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Event management is disabled</CardTitle>
                <CardDescription>
                  Turn the event management toggle back on from the admin dashboard to access this page again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminGuard>
    )
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Group events by status for stats
  const upcomingCount = events.filter(e => e.status === 'upcoming').length
  const ongoingCount = events.filter(e => e.status === 'ongoing').length
  const completedCount = events.filter(e => e.status === 'completed').length
  const cancelledCount = events.filter(e => e.status === 'cancelled').length

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Manage Events</h1>
              <p className="text-xl text-muted-foreground">Create, edit, and manage all college events.</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <Link href="/admin/events/new">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ongoing</p>
                  <p className="text-2xl font-bold text-foreground">{ongoingCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-foreground">{cancelledCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by title, description, or location..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({events.length})
                </Button>
                <Button
                  variant={statusFilter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("upcoming")}
                >
                  Upcoming ({upcomingCount})
                </Button>
                <Button
                  variant={statusFilter === "ongoing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ongoing")}
                >
                  Ongoing ({ongoingCount})
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed ({completedCount})
                </Button>
                <Button
                  variant={statusFilter === "cancelled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelled ({cancelledCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Events ({filteredEvents.length})</CardTitle>
            <CardDescription>Manage and organize your college events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first event."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/admin/events/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const eventDate = new Date(event.event_date)
                      const endDate = event.end_date ? new Date(event.end_date) : null
                      const isMultiDay = endDate && endDate.getTime() !== eventDate.getTime()
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-xs">
                              <div className="truncate">{event.title}</div>
                              {(event.organizer_name || event.organizer) && (
                                <div className="text-xs text-muted-foreground">
                                  by {event.organizer_name || event.organizer?.full_name || 'Unknown'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-sm">
                                  {eventDate.toLocaleDateString()}
                                </div>
                                {isMultiDay && endDate && (
                                  <div className="text-xs text-muted-foreground">
                                    to {endDate.toLocaleDateString()}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {event.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.category ? (
                              <Badge variant="outline" style={{ backgroundColor: event.category.color + '20' }}>
                                {event.category.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Uncategorized</Badge>
                            )}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              {event.current_participants}
                              {event.max_participants && ` / ${event.max_participants}`}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="ghost" asChild title="View Event">
                                <Link href={`/events/${event.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="ghost" asChild title="Edit Event">
                                <Link href={`/admin/events/${event.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDelete(event.id, event.title)}
                                disabled={deletingId === event.id}
                                title="Delete Event"
                              >
                                {deletingId === event.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
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
              Are you sure you want to delete <span className="font-semibold text-foreground">"{eventToDelete?.title}"</span>?
              <br />
              <br />
              This action cannot be undone. All event data, including {events.find(e => e.id === eventToDelete?.id)?.current_participants || 0} registrations, will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingId ? (
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
