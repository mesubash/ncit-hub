import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type EventRegistrationRow =
  Database["public"]["Tables"]["event_registrations"]["Row"];

// Enhanced Event interface with organizer details
export interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  event_date: string;
  end_date?: string | null; // For multi-day events
  location: string;
  max_participants: number | null;
  current_participants: number;
  registration_deadline: string | null;
  images: string[];
  featured_image: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
  status: "registered" | "attended" | "cancelled";
}

// Utility function to generate URL-friendly slug from title
export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
}

// Create a new event
export async function createEvent(eventData: {
  title: string;
  description: string;
  organizer_id: string;
  category_id?: string;
  event_date: string;
  end_date?: string;
  location: string;
  max_participants?: number;
  registration_deadline?: string;
  images?: string[];
  featured_image?: string;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
}): Promise<{ event: Event | null; error: string | null }> {
  const supabase = createClient();

  // Generate slug from title
  const baseSlug = generateEventSlug(eventData.title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists and make it unique
  while (true) {
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: eventData.title,
      slug: slug,
      description: eventData.description,
      organizer_id: eventData.organizer_id,
      category_id: eventData.category_id,
      event_date: eventData.event_date,
      end_date: eventData.end_date,
      location: eventData.location,
      max_participants: eventData.max_participants,
      registration_deadline: eventData.registration_deadline,
      images: eventData.images || [],
      featured_image: eventData.featured_image,
      status: eventData.status || "upcoming",
    })
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .single();

  if (error) {
    return { event: null, error: error.message };
  }

  return { event: transformEventData(data), error: null };
}

// Update an event
export async function updateEvent(
  id: string,
  updates: Partial<EventUpdate>
): Promise<{ event: Event | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .single();

  if (error) {
    return { event: null, error: error.message };
  }

  return { event: transformEventData(data), error: null };
}

// Get event by ID
export async function getEventById(
  id: string
): Promise<{ event: Event | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return { event: null, error: error.message };
  }

  return { event: transformEventData(data), error: null };
}

// Get events by organizer
export async function getEventsByOrganizer(
  organizerId: string
): Promise<{ events: Event[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("organizer_id", organizerId)
    .order("event_date", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data.map(transformEventData), error: null };
}

// Get all events
export async function getAllEvents(): Promise<{
  events: Event[];
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .order("event_date", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data.map(transformEventData), error: null };
}

// Get upcoming events
export async function getUpcomingEvents(): Promise<{
  events: Event[];
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .gte("event_date", new Date().toISOString())
    .eq("status", "upcoming")
    .order("event_date", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data.map(transformEventData), error: null };
}

// Get events by category
export async function getEventsByCategory(
  categoryId: string
): Promise<{ events: Event[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .eq("category_id", categoryId)
    .order("event_date", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data.map(transformEventData), error: null };
}

// Search events
export async function searchEvents(
  query: string
): Promise<{ events: Event[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles:organizer_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      categories:category_id (
        id,
        name,
        color
      )
    `
    )
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
    )
    .order("event_date", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data.map(transformEventData), error: null };
}

// Register for event
export async function registerForEvent(
  eventId: string,
  userId: string
): Promise<{ registration: EventRegistration | null; error: string | null }> {
  const supabase = createClient();

  // Check if already registered
  const { data: existingRegistration } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (existingRegistration) {
    return { registration: null, error: "Already registered for this event" };
  }

  // Check if event is full
  const { data: event } = await supabase
    .from("events")
    .select("max_participants, current_participants")
    .eq("id", eventId)
    .single();

  if (
    event &&
    event.max_participants &&
    event.current_participants >= event.max_participants
  ) {
    return { registration: null, error: "Event is full" };
  }

  // Register for event
  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: userId,
      status: "registered",
    })
    .select()
    .single();

  if (error) {
    return { registration: null, error: error.message };
  }

  // Increment current participants
  await supabase.rpc("increment_event_participants", { event_id: eventId });

  return { registration: data, error: null };
}

// Cancel event registration
export async function cancelEventRegistration(
  eventId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  // Decrement current participants
  await supabase.rpc("decrement_event_participants", { event_id: eventId });

  return { error: null };
}

// Get user's event registrations
export async function getUserEventRegistrations(
  userId: string
): Promise<{ registrations: EventRegistration[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("user_id", userId)
    .order("registration_date", { ascending: false });

  if (error) {
    return { registrations: [], error: error.message };
  }

  return { registrations: data, error: null };
}

// Check if user is registered for event
export async function isUserRegisteredForEvent(
  eventId: string,
  userId: string
): Promise<{ registered: boolean; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return { registered: false, error: error.message };
  }

  return { registered: !!data, error: null };
}

// Delete event
export async function deleteEvent(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Helper function to transform database data to Event interface
function transformEventData(data: any): Event {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    organizer_id: data.organizer_id,
    organizer: data.profiles
      ? {
          id: data.profiles.id,
          full_name: data.profiles.full_name,
          email: data.profiles.email,
          avatar_url: data.profiles.avatar_url,
        }
      : undefined,
    category_id: data.category_id,
    category: data.categories
      ? {
          id: data.categories.id,
          name: data.categories.name,
          color: data.categories.color,
        }
      : undefined,
    event_date: data.event_date,
    location: data.location,
    max_participants: data.max_participants,
    current_participants: data.current_participants,
    registration_deadline: data.registration_deadline,
    images: data.images || [],
    featured_image: data.featured_image,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
