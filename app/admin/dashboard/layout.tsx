// app/admin/dashboard/layout.tsx
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "../../../components/dashboardComponent/Sidebar"
import { MobileNav } from "../../../components/dashboardComponent/MobileNav"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the application",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
