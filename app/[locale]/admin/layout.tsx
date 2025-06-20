import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/auth"
import NotAllowed from "@/components/not-allowed"
import { Sidebar } from "@/components/dashboard/admin/sidebar"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the application",
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const { locale } = await params

  if (!session || session.user.role !== "admin") {
    return <NotAllowed />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
