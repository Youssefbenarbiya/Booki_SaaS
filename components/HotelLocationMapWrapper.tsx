"use client"

import dynamic from "next/dynamic"

// Dynamically import the map component with SSR disabled
const HotelLocationMap = dynamic(
  () => import("@/components/HotelLocationMap"),
  { ssr: false }
)

interface HotelLocationMapWrapperProps {
  latitude?: string | number
  longitude?: string | number
  height?: string
  readOnly?: boolean
  enableNavigation?: boolean
  enableSearch?: boolean
}

export default function HotelLocationMapWrapper({
  latitude,
  longitude,
  height = "400px",
  readOnly = true,
  enableNavigation = true,
  enableSearch = false,
}: HotelLocationMapWrapperProps) {
  if (!latitude || !longitude) {
    return <div className="h-64 bg-gray-100 flex items-center justify-center">No location data available</div>
  }
  
  return (
    <HotelLocationMap
      latitude={latitude}
      longitude={longitude}
      height={height}
      readOnly={readOnly}
      enableNavigation={enableNavigation}
      enableSearch={enableSearch}
    />
  )
} 