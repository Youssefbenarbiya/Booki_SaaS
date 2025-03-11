"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface StarRatingProps {
  onChange: (selectedRatings: number[]) => void
  selectedRatings: number[]
}

export function StarRatingFilter({ onChange, selectedRatings: initialSelectedRatings }: StarRatingProps) {
  const ratings = [5, 4, 3, 2, 1]
  const [selectedRatings, setSelectedRatings] = useState<number[]>(initialSelectedRatings)

  useEffect(() => {
    setSelectedRatings(initialSelectedRatings)
  }, [initialSelectedRatings])

  const handleRatingChange = (rating: number, checked: boolean) => {
    let newSelectedRatings: number[]

    if (checked) {
      newSelectedRatings = [...selectedRatings, rating].sort((a, b) => b - a)
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
              className="flex items-center gap-1 cursor-pointer"
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
              <span className="ml-1 text-sm text-gray-600">
                ({rating} {rating === 1 ? "star" : "stars"})
              </span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
