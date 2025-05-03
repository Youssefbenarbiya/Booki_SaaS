import { headers } from "next/headers"
import { auth } from "@/auth"
import NotAllowed from "@/components/not-allowed"
import { ReactNode } from "react"
import { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/agency/Sidebar"
import { Locale } from "@/i18n/routing"

interface AgencyLayoutProps {
  children: ReactNode
  params: Promise<{ locale: Locale }> 
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
  params,
}: AgencyLayoutProps) {
  // 1) Await the params promise immediately
  const { locale } = await params // ✔️ params resolved

  // 2) Fetch auth/session as before
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (
    !session ||
    (session.user.role !== "agency owner" && session.user.role !== "employee")
  ) {
    return <NotAllowed />
  }

  // 3) Render with `locale`
  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        <Sidebar locale={locale} />
        <div className="flex-1 lg:pl-72">
          <main className="overflow-y-auto max-h-screen">{children}</main>
        </div>
      </div>
    </div>
  )
}
