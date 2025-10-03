import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] GET complaint by ID:", params.id)

    const supabase = createServerClient()
    console.log("[v0] Supabase client created successfully")

    const { data: complaint, error } = await supabase.from("complaints").select("*").eq("id", params.id).single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }

    if (!complaint) {
      console.log("[v0] Complaint not found for ID:", params.id)
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    console.log("[v0] Complaint found successfully")
    return NextResponse.json({ complaint })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] PATCH complaint by ID:", params.id)

    const supabase = createServerClient()
    const data = await request.json()

    console.log("[v0] Update data:", data)

    const { data: complaint, error } = await supabase
      .from("complaints")
      .update({
        status: data.status,
        assigned_to: data.assigned_to,
        resolution_notes: data.resolution_notes,
        resolved_at: data.status === "resolved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Update error:", error)
      return NextResponse.json({ error: "Failed to update complaint: " + error.message }, { status: 500 })
    }

    await supabase.from("activity_logs").insert([
      {
        entity_type: "complaint",
        entity_id: params.id,
        action: "updated",
        details: `Status changed to ${data.status}`,
        performed_by: data.performed_by,
      },
    ])

    console.log("[v0] Complaint updated successfully")
    return NextResponse.json({ complaint })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 })
  }
}
