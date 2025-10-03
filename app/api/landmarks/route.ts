import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json([
        {
          id: 1,
          name: "Barangay Hall",
          purok: "Purok 1",
          description: "Main administrative building",
          is_active: true,
        },
        {
          id: 2,
          name: "Elementary School",
          purok: "Purok 2",
          description: "Primary education facility",
          is_active: true,
        },
        { id: 3, name: "Health Center", purok: "Purok 3", description: "Community health facility", is_active: true },
        {
          id: 4,
          name: "Basketball Court",
          purok: "Purok 4",
          description: "Community sports facility",
          is_active: true,
        },
        { id: 5, name: "Chapel", purok: "Purok 5", description: "Community worship place", is_active: true },
        { id: 6, name: "Market Area", purok: "Purok 6", description: "Local market and trading area", is_active: true },
        { id: 7, name: "Water Station", purok: "Purok 7", description: "Community water supply", is_active: true },
        {
          id: 8,
          name: "Community Center",
          purok: "Purok 8",
          description: "Multi-purpose community building",
          is_active: true,
        },
      ])
    }

    const { data: landmarks, error } = await supabase
      .from("landmarks")
      .select("*")
      .eq("is_active", true)
      .order("purok", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: "Failed to fetch landmarks" }, { status: 500 })
    }

    return NextResponse.json(landmarks || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json([])
  }
}
