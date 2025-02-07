// app/admin/dashboard/layout.tsx
import { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Perform authentication
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }
  if (session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen">
      {/* Main content area: add right margin so it doesn’t get covered by the sidebar */}
      <main className="flex-1 p-4 mr-64">{children}</main>

      {/* Sidebar fixed on the right */}
      <aside className="w-64 bg-gray-100 p-4 fixed right-0 top-0 h-full border-l border-gray-200">
        <h2 className="text-lg font-bold mb-4">Dashboard Navigation</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <Link href="/admin/dashboard" className="text-blue-500">
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/admin/dashboard/flights" className="text-blue-500">
                Flights
              </Link>
            </li>
            {/* Add additional navigation items here */}
          </ul>
        </nav>
      </aside>
    </div>
  )
}
