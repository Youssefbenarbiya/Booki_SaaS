/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { StarRatingFilter } from "./StarRatingFilter"
import { AmenitiesFilter } from "./AmenitiesFilter"
import { SearchFilterBar } from "./SearchFilterBar"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "../../ui/separator"

interface HotelFilterProps {
  onFilterChange: (filters: any) => void
  className?: string
  onMobileClose?: () => void
  isMobileView?: boolean
  searchParams?: {
    city?: string
    checkIn?: string
    checkOut?: string
  }
}

export function HotelFilter({
  onFilterChange,
  className = "",
  onMobileClose,
  isMobileView = false,
  searchParams = {},
}: HotelFilterProps) {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    ratings: [] as number[],
    amenities: [] as string[],
  })

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceChange = (min: number, max: number) => {
    updateFilters("priceRange", { min, max })
  }

  const handleRatingChange = (ratings: number[]) => {
    updateFilters("ratings", ratings)
  }

  const handleAmenitiesChange = (amenities: string[]) => {
    updateFilters("amenities", amenities)
  }

  const clearFilters = () => {
    const resetFilters = {
      priceRange: { min: 0, max: 1000 },
      ratings: [],
      amenities: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card className={`${className} ${isMobileView ? "rounded-t-none" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          {isMobileView && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <SearchFilterBar
          initialCity={searchParams?.city}
          initialCheckIn={searchParams?.checkIn}
          initialCheckOut={searchParams?.checkOut}
        />

        <Separator className="my-4" />

        <Button
          variant="outline"
          className="mb-4 text-sm"
          onClick={clearFilters}
        >
          Clear all filters
        </Button>

        <div className="space-y-6">
          <PriceRangeFilter
            minPrice={0}
            maxPrice={1000}
            onChange={handlePriceChange}
          />

          <Separator />

          <StarRatingFilter onChange={handleRatingChange} />

          <Separator />

          <AmenitiesFilter onChange={handleAmenitiesChange} />
        </div>
      </CardContent>
    </Card>
  )
}
