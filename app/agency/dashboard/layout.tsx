// app/agency/dashboard/layout.tsx
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { Sidebar } from "../../../components/dashboard/agency/Sidebar"
import NotAllowed from "@/components/not-allowed"
import { ReactNode } from "react"
import { NotificationCenter } from "@/components/agency/NotificationCenter"
import { getAgencyNotifications } from "@/actions/agency/notificationActions"

interface DashboardLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the application",
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== "agency owner") {
    return <NotAllowed />
  }

  const { notifications, unreadCount } = await getAgencyNotifications(5)
  const typedNotifications = notifications.map((notification) => ({
    ...notification,
    type: (["error", "info", "success", "warning"].includes(notification.type)
      ? notification.type
      : "info") as "error" | "info" | "success" | "warning",
  }))

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:pl-72">
          <header className="bg-white shadow z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <NotificationCenter
                  initialNotifications={typedNotifications}
                  unreadCount={unreadCount}
                />
              </div>
            </div>
          </header>
          <main className="p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
