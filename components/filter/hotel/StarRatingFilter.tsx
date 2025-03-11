"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface StarRatingProps {
  onChange: (selectedRatings: number[]) => void
}

export function StarRatingFilter({ onChange }: StarRatingProps) {
  const ratings = [5, 4, 3, 2, 1]
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])

  const handleRatingChange = (rating: number, checked: boolean) => {
    let newSelectedRatings: number[]

    if (checked) {
      newSelectedRatings = [...selectedRatings, rating]
    } else {
      newSelectedRatings = selectedRatings.filter((r) => r !== rating)
    }

    setSelectedRatings(newSelectedRatings)
    onChange(newSelectedRatings)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Star Rating</h3>

      <div className="space-y-2">
        {ratings.map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <Checkbox
              id={`rating-${rating}`}
              checked={selectedRatings.includes(rating)}
              onCheckedChange={(checked) =>
                handleRatingChange(rating, checked === true)
              }
            />
            <Label
              htmlFor={`rating-${rating}`}
              className="flex items-center gap-1"
            >
              {Array(rating)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-orange-500">
                    ★
                  </span>
                ))}
              {Array(5 - rating)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-gray-300">
                    ★
                  </span>
                ))}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
