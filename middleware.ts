// import { betterFetch } from "@better-fetch/fetch"
// import { NextResponse, type NextRequest } from "next/server"
// import type { Session } from "@/auth"

// const authRoutes = ["/sign-in", "/sign-up"]
// const passwordRoutes = ["/reset-password", "/forgot-password"]
// const adminRoutes = ["/admin"]
// const notProtectedRoutes = ["/contact", "/about", "/faq", "/blog"]

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname

  //   // Skip middleware for these paths
  //   if (
  //     pathName === "/" ||
  //     pathName.startsWith("/_next/") ||
  //     pathName.startsWith("/assets")
  //   ) {
  //     return NextResponse.next()
  //   }

  //   // Check if current route is in any protected category
  //   const isAuthRoute = authRoutes.includes(pathName)
  //   const isPasswordRoute = passwordRoutes.includes(pathName)
  //   const isAdminRoute = adminRoutes.includes(pathName)
  //   const isNotProtected = notProtectedRoutes.includes(pathName) // New check

  //   // Fetch session data
  //   const { data: session } = await betterFetch<Session>(
  //     "/api/auth/get-session",
  //     {
  //       baseURL: process.env.BETTER_AUTH_URL,
  //       headers: {
  //         cookie: request.headers.get("cookie") || "",
  //       },
  //     }
  //   )

  //   // Allow access to not-protected routes regardless of session
  //   if (isNotProtected) {
  //     return NextResponse.next()
  //   }

  //   // Handle unauthenticated users
  //   if (!session) {
  //     if (isAuthRoute || isPasswordRoute) {
  //       return NextResponse.next()
  //     }
  //     return NextResponse.redirect(new URL("/sign-in", request.url))
  //   }

  //   // Redirect authenticated users from auth/password routes
  //   if (isAuthRoute || isPasswordRoute) {
  //     return NextResponse.redirect(new URL("/", request.url))
  //   }

  //   // Protect admin routes
  //   if (isAdminRoute && session.user.role !== "admin") {
  //     return NextResponse.redirect(new URL("/", request.url))
  //   }

  //   return NextResponse.next()
  // }
}
// Middleware matcher configuration remains the same
export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
}
