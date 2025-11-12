"use client"

import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type FeatureToggleRow = Database["public"]["Tables"]["feature_toggles"]["Row"]

export const FEATURE_TOGGLE_KEYS = {
  EVENT_MANAGEMENT: "event_management",
} as const

export async function fetchFeatureToggle(
  feature: string,
): Promise<{ toggle: FeatureToggleRow | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("feature_toggles")
    .select("feature, description, is_enabled, updated_at, updated_by")
    .eq("feature", feature)
    .single()

  if (error) {
    return { toggle: null, error: error.message }
  }

  return { toggle: data, error: null }
}

export async function setFeatureToggle(
  feature: string,
  isEnabled: boolean,
  updatedBy?: string,
): Promise<{ toggle: FeatureToggleRow | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("feature_toggles")
    .upsert(
      {
        feature,
        is_enabled: isEnabled,
        updated_by: updatedBy || null,
      },
      {
        onConflict: "feature",
      },
    )
    .select()
    .single()

  if (error) {
    return { toggle: null, error: error.message }
  }

  return { toggle: data, error: null }
}
