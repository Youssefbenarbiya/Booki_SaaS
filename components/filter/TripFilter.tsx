"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Calendar,
  MapPin,
  UtensilsCrossed,
  Wifi,
  Car,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterProps {
  onFilterChange: (filters: TripFilterOptions) => void
  className?: string
  isMobileView?: boolean
  searchParams?: Record<string, string | string[] | undefined>
}

export interface TripFilterOptions {
  priceRange: {
    min: number
    max: number
  }
  duration: {
    min: number
    max: number
  }
  ratings: number[]
  amenities: string[]
  categories: string[]
}

const defaultFilters: TripFilterOptions = {
  priceRange: { min: 0, max: 5000 },
  duration: { min: 1, max: 30 },
  ratings: [],
  amenities: [],
  categories: [],
}

const amenitiesOptions = [
  { id: "wifi", label: "Wi-Fi", icon: <Wifi className="h-4 w-4 mr-2" /> },
  {
    id: "meals",
    label: "Meals Included",
    icon: <UtensilsCrossed className="h-4 w-4 mr-2" />,
  },
  {
    id: "transport",
    label: "Transportation",
    icon: <Car className="h-4 w-4 mr-2" />,
  },
  { id: "guide", label: "Tour Guide", icon: null },
  { id: "accommodation", label: "Accommodation", icon: null },
  { id: "insurance", label: "Travel Insurance", icon: null },
]

const categoryOptions = [
  "Adventure",
  "Beach",
  "City",
  "Cultural",
  "Family",
  "Luxury",
  "Nature",
  "Romantic",
]

export function TripFilter({
  onFilterChange,
  className,
  isMobileView = false,
  searchParams,
}: FilterProps) {
  const [filters, setFilters] = useState<TripFilterOptions>(defaultFilters)
  const initialRenderDone = useRef(false)

  // Initialize from URL if available - only on mount
  useEffect(() => {
    if (!initialRenderDone.current && searchParams) {
      const newFilters = { ...defaultFilters }

      if (searchParams.minPrice && searchParams.maxPrice) {
        newFilters.priceRange = {
          min: Number(searchParams.minPrice),
          max: Number(searchParams.maxPrice),
        }
      }

      if (searchParams.minDuration && searchParams.maxDuration) {
        newFilters.duration = {
          min: Number(searchParams.minDuration),
          max: Number(searchParams.maxDuration),
        }
      }

      if (searchParams.rating) {
        const ratings = Array.isArray(searchParams.rating)
          ? searchParams.rating.map(Number)
          : [Number(searchParams.rating)]
        newFilters.ratings = ratings
      }

      if (searchParams.amenities) {
        newFilters.amenities = Array.isArray(searchParams.amenities)
          ? searchParams.amenities
          : [searchParams.amenities]
      }

      if (searchParams.categories) {
        newFilters.categories = Array.isArray(searchParams.categories)
          ? searchParams.categories
          : [searchParams.categories]
      }

      setFilters(newFilters)

      // This is now safe because we only call it once during initialization
      onFilterChange(newFilters)
      initialRenderDone.current = true
    }
  }, [searchParams, onFilterChange])

  const handlePriceChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: { min: value[0], max: value[1] },
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDurationChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      duration: { min: value[0], max: value[1] },
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRatingChange = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter((r) => r !== rating)
      : [...filters.ratings, rating]

    const newFilters = { ...filters, ratings: newRatings }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenityId]
      : filters.amenities.filter((a) => a !== amenityId)

    const newFilters = { ...filters, amenities: newAmenities }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]

    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className={cn("p-4", isMobileView ? "pb-20" : "")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Filter Trips</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-sm text-muted-foreground"
          >
            Reset
          </Button>
        </div>

        <div className="space-y-6">
          {/* Price Range Filter */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center">
              Price Range ($ USD)
            </h4>
            <Slider
              defaultValue={[filters.priceRange.min, filters.priceRange.max]}
              min={0}
              max={5000}
              step={100}
              value={[filters.priceRange.min, filters.priceRange.max]}
              onValueChange={handlePriceChange}
              className="mb-2"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                ${filters.priceRange.min}
              </span>
              <span className="text-sm text-muted-foreground">
                ${filters.priceRange.max}
              </span>
            </div>
          </div>

          <Separator />

          {/* Duration Filter */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Duration (days)
            </h4>
            <Slider
              defaultValue={[filters.duration.min, filters.duration.max]}
              min={1}
              max={30}
              step={1}
              value={[filters.duration.min, filters.duration.max]}
              onValueChange={handleDurationChange}
              className="mb-2"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {filters.duration.min} days
              </span>
              <span className="text-sm text-muted-foreground">
                {filters.duration.max} days
              </span>
            </div>
          </div>

          <Separator />

          {/* Ratings Filter */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Ratings
            </h4>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <Button
                    variant={
                      filters.ratings.includes(rating) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleRatingChange(rating)}
                    className="h-8 w-full justify-start"
                  >
                    <div className="flex items-center">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                      {Array.from({ length: 5 - rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 text-muted-foreground"
                        />
                      ))}
                      <span className="ml-2 text-xs">{rating}+ stars</span>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Amenities Filter */}
          <div>
            <h4 className="font-medium text-sm mb-3">Trip Amenities</h4>
            <div className="space-y-2">
              {amenitiesOptions.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity.id}`}
                    checked={filters.amenities.includes(amenity.id)}
                    onCheckedChange={(checked) =>
                      handleAmenityChange(amenity.id, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`amenity-${amenity.id}`}
                    className="flex items-center text-sm cursor-pointer"
                  >
                    {amenity.icon}
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Categories Filter */}
          <div>
            <h4 className="font-medium text-sm mb-3">Trip Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <Badge
                  key={category}
                  variant={
                    filters.categories.includes(category)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
