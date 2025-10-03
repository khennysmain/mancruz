import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("reportId")
    const reportType = searchParams.get("reportType")

    if (!reportId || !reportType) {
      return NextResponse.json({ error: "Missing reportId or reportType parameter" }, { status: 400 })
    }

    const supabase = createServerClient()

    if (!supabase) {
      console.error("Supabase client not available")
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    const { data: attachments, error } = await supabase
      .from("file_attachments")
      .select("*")
      .eq("entity_id", reportId)
      .eq("entity_type", reportType)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 })
    }

    console.log("[v0] Attachments API - reportId:", reportId, "reportType:", reportType)
    console.log("[v0] Attachments found:", attachments?.length || 0)
    console.log("[v0] Attachment data:", JSON.stringify(attachments, null, 2))

    return NextResponse.json({
      success: true,
      attachments: attachments || [],
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
