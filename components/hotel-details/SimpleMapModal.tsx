"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import SimpleMap from "./SimpleMap"

interface SimpleMapModalProps {
  isOpen: boolean
  onClose: () => void
  latitude?: number | string
  longitude?: number | string
  address: string
  city: string
  country: string
}

export default function SimpleMapModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  address,
  city,
  country,
}: SimpleMapModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 pb-2">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold">Hotel Location</h2>
          <p className="text-gray-600">
            {address}, {city}, {country}
          </p>
        </div>
        
        <div className="flex-grow p-4 pt-0">
          <SimpleMap
            latitude={latitude}
            longitude={longitude}
            height="100%"
            zoom={15}
          />
        </div>
      </div>
    </div>
  )
} 