import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("supabase-auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      if (token.startsWith("admin-")) {
        const userData = request.cookies.get("user-data")?.value

        if (!userData) {
          const loginUrl = new URL("/auth/login", request.url)
          const redirectResponse = NextResponse.redirect(loginUrl)
          redirectResponse.cookies.delete("supabase-auth-token")
          redirectResponse.cookies.delete("user-data")
          return redirectResponse
        }

        try {
          const user = JSON.parse(userData)
          if (user.role !== "admin") {
            const loginUrl = new URL("/auth/login", request.url)
            const redirectResponse = NextResponse.redirect(loginUrl)
            redirectResponse.cookies.delete("supabase-auth-token")
            redirectResponse.cookies.delete("user-data")
            return redirectResponse
          }
        } catch (parseError) {
          const loginUrl = new URL("/auth/login", request.url)
          const redirectResponse = NextResponse.redirect(loginUrl)
          redirectResponse.cookies.delete("supabase-auth-token")
          redirectResponse.cookies.delete("user-data")
          return redirectResponse
        }
      } else {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token)

        if (error || !user) {
          const loginUrl = new URL("/auth/login", request.url)
          const redirectResponse = NextResponse.redirect(loginUrl)
          redirectResponse.cookies.delete("supabase-auth-token")
          return redirectResponse
        }
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
