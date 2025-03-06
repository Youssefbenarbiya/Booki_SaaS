"use client"

import LocationMapSelector from "./LocationMapSelector"

interface HotelLocationMapProps {
  latitude?: string | number
  longitude?: string | number
  height?: string
}

export default function HotelLocationMap({
  latitude,
  longitude,
  height = "400px"
}: HotelLocationMapProps) {
  // Convert string coordinates to numbers or use defaults
  const parsedLatitude = latitude ? Number(latitude) : undefined
  const parsedLongitude = longitude ? Number(longitude) : undefined
  
  // Empty function as we don't need to select locations in view mode
  const handleLocationSelected = () => {}
  
  return (
    <div className="h-full w-full">
      <LocationMapSelector
        initialLatitude={parsedLatitude}
        initialLongitude={parsedLongitude}
        onLocationSelected={handleLocationSelected}
        enableSearch={false}
        height={height}
      />
    </div>
  )
}
