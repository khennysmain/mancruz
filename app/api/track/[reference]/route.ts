import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const supabase = createServerClient()
    const referenceNumber = params.reference

    const { data: complaint, error: complaintError } = await supabase
      .from("complaints")
      .select("*")
      .eq("reference_number", referenceNumber)
      .single()

    if (complaint && !complaintError) {
      return NextResponse.json({
        result: {
          ...complaint,
          type: "complaint",
        },
      })
    }

    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .select("*")
      .eq("reference_number", referenceNumber)
      .single()

    if (incident && !incidentError) {
      return NextResponse.json({
        result: {
          ...incident,
          type: "incident",
        },
      })
    }

    // Not found in either table
    return NextResponse.json({ error: "No record found with this reference number" }, { status: 404 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
