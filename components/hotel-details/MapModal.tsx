"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import HotelLocationMap from "../HotelLocationMap"

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  latitude?: number | string
  longitude?: number | string
  address: string
  city: string
  country: string
}

export default function MapModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  address,
  city,
  country,
}: MapModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isMounted) return null
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg p-4 mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-semibold mb-2">Hotel Location</h2>
        <p className="text-gray-600 mb-4">
          {address}, {city}, {country}
        </p>
        
        <div className="h-[calc(100%-100px)] w-full rounded-lg overflow-hidden">
          <HotelLocationMap
            latitude={latitude}
            longitude={longitude}
            height="100%"
            readOnly={true}
            enableSearch={false}
            enableNavigation={true}
          />
        </div>
      </div>
    </div>
  )
} 