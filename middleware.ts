import { betterFetch } from "@better-fetch/fetch"
import { NextResponse, type NextRequest } from "next/server"
import type { Session } from "@/auth"

const authRoutes = ["/sign-in", "/sign-up"]
const passwordRoutes = ["/reset-password", "/forgot-password"]
const adminRoutes = ["/admin"]

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname

  // Skip middleware for the root path `/`
  if (pathName === "/") {
    return NextResponse.next()
  }

  const isAuthRoute = authRoutes.includes(pathName)
  const isPasswordRoute = passwordRoutes.includes(pathName)
  const isAdminRoute = adminRoutes.includes(pathName)

  // Fetch session data
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  )

  // If no session exists
  if (!session) {
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // If a session exists and user tries to access auth or password routes
  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user tries to access admin routes without admin role
  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Middleware matcher configuration
export const config = {
  matcher: [
    // Match all paths except for API and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
