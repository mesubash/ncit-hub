"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type UseFeatureToggleOptions = {
  defaultEnabled?: boolean
  subscribe?: boolean
}

export function useFeatureToggle(
  feature: string,
  options: UseFeatureToggleOptions = {},
) {
  const { defaultEnabled = true, subscribe = false } = options
  const storageKey = `feature-toggle:${feature}`
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(storageKey)
      if (stored !== null) {
        return stored === "true"
      }
    }
    return defaultEnabled
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const persistValue = (value: boolean) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, String(value))
    }
  }

  const applyValue = (value: boolean) => {
    setIsEnabled(value)
    persistValue(value)
  }

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchToggle = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("feature_toggles")
          .select("is_enabled")
          .eq("feature", feature)
          .single()

        if (!isMounted) {
          return
        }

        if (error) {
          setError(error.message)
          applyValue(defaultEnabled)
        } else if (data) {
          applyValue(data.is_enabled)
          setError(null)
        } else {
          applyValue(defaultEnabled)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchToggle()

    let channel: RealtimeChannel | null = null

    if (subscribe) {
      channel = supabase
        .channel(`feature_toggles:${feature}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "feature_toggles",
            filter: `feature=eq.${feature}`,
          },
          (payload) => {
            const nextValue = (payload.new as { is_enabled?: boolean })?.is_enabled
            if (typeof nextValue === "boolean") {
              applyValue(nextValue)
            }
          },
        )
        .subscribe()
    }

    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [feature, subscribe, defaultEnabled])

  const setLocalValue = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsEnabled((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value
      persistValue(nextValue)
      return nextValue
    })
  }, [])

  const state = useMemo(
    () => ({
      isEnabled,
      isLoading,
      error,
      setLocalValue,
    }),
    [isEnabled, isLoading, error, setLocalValue],
  )

  return state
}
