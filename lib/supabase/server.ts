import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string" &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0

export const createServerClient = cache(() => {
  if (!isSupabaseConfigured) {
    console.error("Supabase environment variables are not configured properly.")
    console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
    return null
  }

  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Supabase server client created successfully")
    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
})
