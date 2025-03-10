import type { ReactNode } from "react"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { Sidebar } from "./components/Sidebar"

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user || {}

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  )
}
