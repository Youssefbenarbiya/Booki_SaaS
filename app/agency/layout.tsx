import { headers } from "next/headers"
import { auth } from "@/auth"
import { Sidebar } from "../../components/dashboard/agency/Sidebar"
import NotAllowed from "@/components/not-allowed"
import { ReactNode } from "react"
import { Metadata } from "next"

interface AgencyLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  title: {
    template: "%s | Agency",
    default: "Agency Dashboard",
  },
  description: "Agency management portal",
}

export default async function AgencyLayout({
  children,
}: AgencyLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (
    !session ||
    (session.user.role !== "agency owner" && session.user.role !== "employee")
  ) {
    return <NotAllowed />
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:pl-72">
          <main className="overflow-y-auto max-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 