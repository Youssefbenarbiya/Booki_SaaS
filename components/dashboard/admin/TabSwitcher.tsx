"use client"

import { TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

export function TabSwitcher({
  value,
  children,
}: {
  value: string
  currentTab: string
  children: ReactNode
}) {
  const router = useRouter()

  const handleTabChange = () => {
    // Update URL without reloading the page
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    router.push(url.pathname + url.search)
  }

  return (
    <TabsTrigger
      value={value}
      onClick={handleTabChange}
    >
      {children}
    </TabsTrigger>
  )
}
