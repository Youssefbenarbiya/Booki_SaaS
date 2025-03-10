import { auth } from "@/auth"
import type { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: `Customer Profile`,
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: await headers(),
  })

  if (!session) {
    // Handle no session found; for example, you could redirect to signin.
    return null
  }

  const userName = session.user?.name || "User"

  return (
    <div>
      <div className="bg-gray-100 h-[200px] rounded-lg mb-4">
        {/* Profile Banner */}
      </div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome back, {userName}</h1>
        <p className="text-gray-600">
          Manage your profile information, bookings, and preferences from this
          dashboard.
        </p>
      </div>
    </div>
  )
}
