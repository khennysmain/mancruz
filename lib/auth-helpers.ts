import { createServerClient } from "./supabase/server"

export async function authenticateUser(email: string, password: string) {

  if (email === "barangaymancruzmain@gmail.com" && password === "Zylex27@") {
    const supabase = createServerClient()
    if (!supabase) {
      return { success: false, error: "Database not configured" }
    }

    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error || !user) {
      return { success: false, error: "User not found" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    }
  }

  return { success: false, error: "Invalid credentials" }
}

export function isAdmin(user: any) {
  return user && user.role === "admin"
}
