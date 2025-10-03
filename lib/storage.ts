import { createClient } from "@/lib/supabase/client"

export async function uploadImage(file: File, folder = "general"): Promise<{ url: string; path: string } | null> {
  try {
    const supabase = createClient()

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("complaint-images").upload(fileName, file)

    if (error) {
      console.error("Upload error:", error)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("complaint-images").getPublicUrl(fileName)

    return {
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return null
  }
}

export async function deleteImage(path: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage.from("complaint-images").remove([path])

    return !error
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}
