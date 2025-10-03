import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendComplaintConfirmation } from "@/lib/email"
import { uploadImage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting complaint submission")
    const supabase = createServerClient()

    if (!supabase) {
      console.error("[v0] Supabase client not available")
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const complainant_name = formData.get("complainant_name") as string
    const complainant_email = formData.get("complainant_email") as string
    const complainant_phone = formData.get("complainant_phone") as string
    const complainant_address = formData.get("complainant_address") as string
    const complaint_type = formData.get("complaint_type") as string
    const subject = formData.get("subject") as string
    const description = formData.get("description") as string
    const other_description = formData.get("other_description") as string
    const location = formData.get("location") as string
    const purok = formData.get("purok") as string
    const landmark = formData.get("landmark") as string
    const is_anonymous = formData.get("is_anonymous") === "true"
    const barangay = formData.get("barangay") as string

    console.log("[v0] Extracted fields:", {
      subject,
      description,
      location,
      purok,
      landmark,
      is_anonymous,
      complainant_name: is_anonymous ? "[ANONYMOUS]" : complainant_name,
    })

    if (!subject || !description || !location || !purok) {
      console.log("[v0] Validation failed - missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!is_anonymous && (!complainant_name || !complainant_phone)) {
      console.log("[v0] Validation failed - missing contact info for non-anonymous report")
      return NextResponse.json({ error: "Name and phone are required for non-anonymous reports" }, { status: 400 })
    }

    console.log("[v0] Attempting to insert complaint into database")
    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert([
        {
          complainant_name: is_anonymous ? "[ANONYMOUS]" : complainant_name,
          complainant_email: is_anonymous ? null : complainant_email || null,
          complainant_phone: is_anonymous ? null : complainant_phone || null,
          complainant_address: is_anonymous ? null : complainant_address || null,
          complaint_type: complaint_type || "other",
          subject,
          description,
          other_description: other_description || null,
          location,
          purok,
          landmark: landmark || null,
          is_anonymous,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 })
    }

    console.log("[v0] Complaint inserted successfully:", complaint.id)

    const uploadedFiles = []
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image_${i}`) as File
      if (file && file.size > 0) {
        console.log("[v0] Processing image file:", file.name, file.size)
        const uploadResult = await uploadImage(file, "complaints")
        if (uploadResult) {
          const { data: fileRecord, error: fileError } = await supabase
            .from("file_attachments")
            .insert([
              {
                entity_type: "complaint",
                entity_id: complaint.id,
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
            console.log("[v0] File uploaded successfully:", file.name)
          } else {
            console.error("[v0] File record error:", fileError)
          }
        }
      }
    }

    console.log("[v0] Logging activity")
    await supabase.from("activity_logs").insert([
      {
        entity_type: "complaint",
        entity_id: complaint.id,
        action: "created",
        details: `Complaint "${complaint.subject}" submitted ${is_anonymous ? "anonymously" : `by ${complaint.complainant_name}`} in ${purok}${uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} image(s)` : ""}`,
      },
    ])

    if (!is_anonymous && complaint.complainant_email) {
      console.log("[v0] Sending confirmation email")
      try {
        await sendComplaintConfirmation(
          complaint.complainant_email,
          complaint.complainant_name,
          complaint.reference_number,
          complaint.subject,
        )
        console.log("[v0] Confirmation email sent successfully")
      } catch (emailError) {
        console.error("[v0] Failed to send confirmation email:", emailError)
        // Don't fail the entire request if email fails
      }
    }

    console.log("[v0] Complaint submission completed successfully")
    return NextResponse.json({
      success: true,
      message:
        !is_anonymous && complaint.complainant_email
          ? "Complaint submitted successfully! A confirmation email with your reference number has been sent."
          : "Complaint submitted successfully! You will be contacted within 24 hours.",
      reference_number: complaint.reference_number,
      uploaded_files: uploadedFiles.length,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
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

    let query = supabase.from("complaints").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (purok && purok !== "all") {
      query = query.eq("purok", purok)
    }
    if (search) {
      query = query.or(
        `subject.ilike.%${search}%,complainant_name.ilike.%${search}%,location.ilike.%${search}%,purok.ilike.%${search}%`,
      )
    }

    const { data: complaints, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 })
    }

    return NextResponse.json({ complaints })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
