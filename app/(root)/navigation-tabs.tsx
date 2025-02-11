"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function NavigationTabs({
  activeTab = "trips",
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
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
        <button
          onClick={() => handleTabChange("trips")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "trips"
              ? "bg-orange-500 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Trips
        </button>
        <button
          onClick={() => handleTabChange("hotels")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "hotels"
              ? "bg-orange-500 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Hotels
        </button>
      </div>
    </div>
  )
}
