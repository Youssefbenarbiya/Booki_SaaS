"use client"

import NotAllowed from "@/components/not-allowed"
import { WalletDashboard } from "./wallet-dashboard"
import { useSession } from "@/auth-client"

export default function WalletPage() {
  const session = useSession()
  const userRole = session.data?.user?.role

  if (userRole === "employee") {
    return <NotAllowed />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <WalletDashboard />
    </main>
  )
}
