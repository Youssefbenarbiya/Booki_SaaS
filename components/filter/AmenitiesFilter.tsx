"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const AMENITIES = [
  { id: "wifi", label: "Free WiFi" },
  { id: "parking", label: "Free Parking" },
  { id: "breakfast", label: "Free Breakfast" },
  { id: "pool", label: "Swimming Pool" },
  { id: "gym", label: "Gym/Fitness Center" },
  { id: "spa", label: "Spa" },
  { id: "ac", label: "Air Conditioning" },
  { id: "restaurant", label: "Restaurant" },
  { id: "pets", label: "Pet Friendly" },
]

interface AmenitiesFilterProps {
  onChange: (selectedAmenities: string[]) => void
}

export function AmenitiesFilter({ onChange }: AmenitiesFilterProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)

  const displayedAmenities = showAll ? AMENITIES : AMENITIES.slice(0, 5)

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

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Amenities</h3>

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
            <Label htmlFor={`amenity-${amenity.id}`}>{amenity.label}</Label>
          </div>
        ))}
      </div>

      {AMENITIES.length > 5 && (
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "Show all amenities"}
        </button>
      )}
    </div>
  )
}
