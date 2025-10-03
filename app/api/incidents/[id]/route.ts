import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data: incident, error } = await supabase.from("incidents").select("*").eq("id", params.id).single()

    if (error || !incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const data = await request.json()

    const { data: incident, error } = await supabase
      .from("incidents")
      .update({
        status: data.status,
        assigned_to: data.assigned_to,
        action_taken: data.action_taken,
        resolved_at: data.status === "resolved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update incident" }, { status: 500 })
    }

    // Log activity
    await supabase.from("activity_logs").insert([
      {
        entity_type: "incident",
        entity_id: params.id,
        action: "updated",
        details: `Status changed to ${data.status}`,
        performed_by: data.performed_by,
      },
    ])

    return NextResponse.json({ incident })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
