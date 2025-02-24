"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function NavigationTabs({
  activeTab = "trip",
}: {
  activeTab?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", type)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex">
      <div className="inline-flex bg-white rounded-t-lg border-t border-x border-gray-200">
        <button
          onClick={() => handleTabChange("trip")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "trip"
              ? "bg-white text-black border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ✈️ Trip
        </button>
        <button
          onClick={() => handleTabChange("hotels")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "hotels"
              ? "bg-white text-black border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🏨 Hotels
        </button>
      </div>
    </div>
  )
}
