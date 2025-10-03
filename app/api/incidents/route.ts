import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendIncidentConfirmation } from "@/lib/email"
import { uploadImage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      console.error("Supabase client not available")
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    const formData = await request.formData()

    const reporter_name = formData.get("reporter_name") as string
    const reporter_email = formData.get("reporter_email") as string
    const reporter_phone = formData.get("reporter_phone") as string
    const reporter_address = formData.get("reporter_address") as string
    const incident_type = formData.get("incident_type") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const other_description = formData.get("other_description") as string
    const location = formData.get("location") as string
    const purok = formData.get("purok") as string
    const landmark = formData.get("landmark") as string
    const incident_date = formData.get("incident_date") as string
    const is_anonymous = formData.get("is_anonymous") === "true"
    const barangay = formData.get("barangay") as string

    if (!title || !description || !location || !incident_date || !purok) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!is_anonymous && (!reporter_name || !reporter_phone)) {
      return NextResponse.json({ error: "Name and phone are required for non-anonymous reports" }, { status: 400 })
    }

    const { data: incident, error } = await supabase
      .from("incidents")
      .insert([
        {
          reporter_name: is_anonymous ? null : reporter_name,
          reporter_email: is_anonymous ? null : reporter_email || null,
          reporter_phone: is_anonymous ? null : reporter_phone || null,
          reporter_address: is_anonymous ? null : reporter_address || null,
          incident_type: incident_type || "other",
          title,
          description,
          other_description: other_description || null,
          location,
          purok,
          landmark: landmark || null,
          incident_date,
          is_anonymous,
          status: "reported",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to report incident" }, { status: 500 })
    }

    const uploadedFiles = []
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image_${i}`) as File
      if (file && file.size > 0) {
        const uploadResult = await uploadImage(file, "incidents")
        if (uploadResult) {
          const { data: fileRecord, error: fileError } = await supabase
            .from("file_attachments")
            .insert([
              {
                entity_type: "incident",
                entity_id: incident.id,
                file_name: file.name,
                file_path: uploadResult.path,
                file_url: uploadResult.url,
                mime_type: file.type,
                file_size: file.size,
                is_image: true,
              },
            ])
            .select()
            .single()

          if (!fileError) {
            uploadedFiles.push(fileRecord)
          }
        }
      }
    }

    await supabase.from("activity_logs").insert([
      {
        entity_type: "incident",
        entity_id: incident.id,
        action: "created",
        details: `Incident "${incident.title}" reported ${is_anonymous ? "anonymously" : `by ${incident.reporter_name}`} in ${purok}${uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} image(s)` : ""}`,
      },
    ])

    if (!is_anonymous && incident.reporter_email) {
      try {
        await sendIncidentConfirmation(
          incident.reporter_email,
          incident.reporter_name,
          incident.reference_number,
          incident.incident_type,
        )
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message:
        !is_anonymous && incident.reporter_email
          ? "Incident reported successfully! A confirmation email with your reference number has been sent. Authorities will be notified immediately."
          : "Incident reported successfully! Authorities will be notified immediately.",
      reference_number: incident.reference_number,
      uploaded_files: uploadedFiles.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      console.error("Supabase client not available")
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const purok = searchParams.get("purok")

    let query = supabase.from("incidents").select("*").order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (purok && purok !== "all") {
      query = query.eq("purok", purok)
    }
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,reporter_name.ilike.%${search}%,location.ilike.%${search}%,purok.ilike.%${search}%`,
      )
    }

    const { data: incidents, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
    }

    return NextResponse.json({ incidents })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
