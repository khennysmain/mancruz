"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "./supabase/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    console.log("[v0] Login attempt for email:", email.toString())

    if (email.toString() === "barangaymancruzmain@gmail.com" && password.toString() === "Zylex27@") {
      console.log("[v0] Admin credentials matched, checking database...")

      const serverClient = createServerClient()
      if (serverClient) {
        const { data: user, error: userError } = await serverClient
          .from("users")
          .select("*")
          .eq("email", email.toString())
          .single()

        console.log("[v0] Database query result:", { user, userError })

        if (!userError && user && user.role === "admin") {
          console.log("[v0] Admin user found, setting cookies...")

          const cookieStore = cookies()
          cookieStore.set("supabase-auth-token", `admin-${user.id}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, 
          })

          cookieStore.set(
            "user-data",
            JSON.stringify({
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
            }),
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7, 
            },
          )

          console.log("[v0] Cookies set, returning success")
          return { success: true }
        } else {
          console.log("[v0] Admin user not found or invalid role")
          return { error: "Invalid admin credentials" }
        }
      } else {
        console.log("[v0] Supabase client not available")
        return { error: "Database connection error" }
      }
    }

    console.log("[v0] Trying Supabase Auth for regular user...")

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      console.log("[v0] Supabase Auth error:", error.message)
      return { error: error.message }
    }

    const cookieStore = cookies()
    if (data.session) {
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, 
      })
    }

    console.log("[v0] Regular user login successful")
    return { success: true }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()

  try {
    await supabase.auth.signOut()
    cookieStore.delete("supabase-auth-token")
    cookieStore.delete("user-data")
  } catch (error) {
    console.error("Sign out error:", error)
  }

  redirect("/auth/login")
}
