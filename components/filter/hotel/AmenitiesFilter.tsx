"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Updated amenities list with more generic terms that are likely to match hotel data
const AMENITIES = [
  { id: "wifi", label: "WiFi" },
  { id: "parking", label: "Parking" },
  { id: "breakfast", label: "Breakfast" },
  { id: "pool", label: "Swimming Pool" },
  { id: "fitness", label: "Fitness Center" },
  { id: "spa", label: "Spa" },
  { id: "air conditioning", label: "Air Conditioning" },
  { id: "restaurant", label: "Restaurant" },
  { id: "pet", label: "Pet Friendly" },
  { id: "bar", label: "Bar" },
  { id: "room service", label: "Room Service" },
  { id: "business", label: "Business Center" },
  { id: "tv", label: "TV" },
  { id: "laundry", label: "Laundry" },
  { id: "24-hour", label: "24-Hour Service" },
]

interface AmenitiesFilterProps {
  onChange: (selectedAmenities: string[]) => void
  selectedAmenities: string[]
}

export function AmenitiesFilter({ onChange, selectedAmenities: initialSelectedAmenities }: AmenitiesFilterProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialSelectedAmenities)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setSelectedAmenities(initialSelectedAmenities)
  }, [initialSelectedAmenities])

  const displayedAmenities = showAll ? AMENITIES : AMENITIES.slice(0, 8)

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    let newSelectedAmenities: string[]

    if (checked) {
      newSelectedAmenities = [...selectedAmenities, amenityId]
    } else {
      newSelectedAmenities = selectedAmenities.filter((id) => id !== amenityId)
    }

    setSelectedAmenities(newSelectedAmenities)
    onChange(newSelectedAmenities)
  }

  const selectedCount = selectedAmenities.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Amenities</h3>
        {selectedCount > 0 && (
          <span className="text-sm text-gray-600">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayedAmenities.map((amenity) => (
          <div key={amenity.id} className="flex items-center gap-2">
            <Checkbox
              id={`amenity-${amenity.id}`}
              checked={selectedAmenities.includes(amenity.id)}
              onCheckedChange={(checked) =>
                handleAmenityChange(amenity.id, checked === true)
              }
            />
            <Label 
              htmlFor={`amenity-${amenity.id}`}
              className="cursor-pointer text-sm"
            >
              {amenity.label}
            </Label>
          </div>
        ))}
      </div>

      {AMENITIES.length > 8 && (
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show all ${AMENITIES.length} amenities`}
        </button>
      )}
    </div>
  )
}
