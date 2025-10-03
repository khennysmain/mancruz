import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Puroks API called")
    const supabase = createServerClient()

    if (!supabase) {
      console.log("[v0] No Supabase client, returning fallback data")
      return NextResponse.json([
        { id: 1, name: "Purok 1", description: "Purok 1 - Barangay Mancruz" },
        { id: 2, name: "Purok 2", description: "Purok 2 - Barangay Mancruz" },
        { id: 3, name: "Purok 3", description: "Purok 3 - Barangay Mancruz" },
        { id: 4, name: "Purok 4", description: "Purok 4 - Barangay Mancruz" },
      ])
    }

    console.log("[v0] Executing Supabase query: SELECT id, name, description FROM puroks")
    const { data: puroks, error } = await supabase
      .from("puroks")
      .select("id, name, description")
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Database error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json([
        { id: 1, name: "Purok 1", description: "Purok 1 - Barangay Mancruz" },
        { id: 2, name: "Purok 2", description: "Purok 2 - Barangay Mancruz" },
        { id: 3, name: "Purok 3", description: "Purok 3 - Barangay Mancruz" },
        { id: 4, name: "Purok 4", description: "Purok 4 - Barangay Mancruz" },
      ])
    }

    console.log("[v0] Query successful, got", puroks?.length || 0, "puroks")

    const filteredPuroks = puroks
      ? puroks.filter((purok) => {
          const purokNumber = purok.name.match(/\d+/)
          return purokNumber && Number.parseInt(purokNumber[0]) <= 4
        })
      : []

    const uniquePuroks = filteredPuroks.filter(
      (purok, index, self) => index === self.findIndex((p) => p.name === purok.name),
    )

    console.log("[v0] Returning", uniquePuroks.length, "unique puroks (filtered to 1-4)")
    return NextResponse.json(uniquePuroks)
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json([
      { id: 1, name: "Purok 1", description: "Purok 1 - Barangay Mancruz" },
      { id: 2, name: "Purok 2", description: "Purok 2 - Barangay Mancruz" },
      { id: 3, name: "Purok 3", description: "Purok 3 - Barangay Mancruz" },
      { id: 4, name: "Purok 4", description: "Purok 4 - Barangay Mancruz" },
    ])
  }
}
