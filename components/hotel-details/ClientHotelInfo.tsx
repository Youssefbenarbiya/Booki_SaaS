/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import dynamic from "next/dynamic"

// Import HotelInfo with SSR disabled
const HotelInfo = dynamic(
  () => import("@/components/hotel-details/HotelInfo"),
  { ssr: false }
)

// Define the hotel props type to match what HotelInfo expects
interface HotelProps {
  hotel: {
    name: string
    rating: number
    address: string
    city: string
    country: string
    description: string
    amenities: any[]
    latitude?: number
    longitude?: number
  }
}

// Client component wrapper that renders HotelInfo
export default function ClientHotelInfo({ hotel }: HotelProps) {
  return <HotelInfo hotel={hotel} />
}
