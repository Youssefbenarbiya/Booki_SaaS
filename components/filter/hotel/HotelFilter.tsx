/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PriceRangeFilter } from "./PriceRangeFilter"
import { StarRatingFilter } from "./StarRatingFilter"
import { AmenitiesFilter } from "./AmenitiesFilter"
import { SearchFilterBar } from "./SearchFilterBar"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "../../ui/separator"

// Generic Hotel interface that works with the data we have
interface Hotel {
  id: string
  name: string
  address: string
  rating: number
  amenities: string[]
  rooms: Array<{
    id: string
    pricePerNightAdult: string
    [key: string]: any
  }>
  [key: string]: any
}

interface HotelFilterProps {
  hotels: Hotel[]
  onFilterChange: (filteredHotels: Hotel[]) => void
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
  hotels,
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

  // Calculate min and max prices from actual hotel data
  const prices = hotels.map(h => 
    h.rooms && h.rooms.length > 0 
      ? Math.min(...h.rooms.map(r => Number(r.pricePerNightAdult) || 0))
      : 0
  )
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000

  // Log available amenities for debugging
  useEffect(() => {
    if (hotels.length > 0) {
      const allAmenities = new Set<string>();
      hotels.forEach(hotel => {
        if (Array.isArray(hotel.amenities)) {
          hotel.amenities.forEach(amenity => {
            allAmenities.add(amenity.toLowerCase());
          });
        }
      });
      console.log("Available amenities in hotel data:", [...allAmenities]);
    }
  }, [hotels]);

  useEffect(() => {
    // Initialize price range based on actual hotel data
    setFilters(prev => ({
      ...prev,
      priceRange: { min: minPrice, max: maxPrice }
    }))
  }, [minPrice, maxPrice])

  const applyFilters = (newFilters: typeof filters) => {
    const filteredHotels = hotels.filter(hotel => {
      // Price filter - check if any room's price is in the range
      const minRoomPrice = hotel.rooms && hotel.rooms.length > 0
        ? Math.min(...hotel.rooms.map(r => Number(r.pricePerNightAdult) || 0))
        : 0
      const priceInRange = minRoomPrice >= newFilters.priceRange.min && 
                          minRoomPrice <= newFilters.priceRange.max

      // Rating filter
      const ratingMatch = newFilters.ratings.length === 0 || 
        newFilters.ratings.includes(Math.floor(hotel.rating))

      // Amenities filter - ensure hotel.amenities is an array
      const hotelAmenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
      
      // Convert amenities to lowercase for case-insensitive comparison
      const normalizedHotelAmenities = hotelAmenities.map(a => a.toLowerCase());
      
      // Check if all selected amenities are included in the hotel's amenities
      // Using a more flexible matching approach that checks if any hotel amenity contains the selected amenity term
      const amenitiesMatch = newFilters.amenities.length === 0 ||
        newFilters.amenities.every(selectedAmenity => {
          const selectedAmenityLower = selectedAmenity.toLowerCase();
          return normalizedHotelAmenities.some(hotelAmenity => 
            hotelAmenity.includes(selectedAmenityLower) || 
            selectedAmenityLower.includes(hotelAmenity)
          );
        });

      // For debugging
      if (newFilters.amenities.length > 0 && !amenitiesMatch) {
        console.log("Hotel failed amenities match:", hotel.name);
        console.log("Hotel amenities:", normalizedHotelAmenities);
        console.log("Selected amenities:", newFilters.amenities);
      }

      return priceInRange && ratingMatch && amenitiesMatch
    })

    onFilterChange(filteredHotels)
  }

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
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
      priceRange: { min: minPrice, max: maxPrice },
      ratings: [],
      amenities: [],
    }
    setFilters(resetFilters)
    applyFilters(resetFilters)
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
            minPrice={minPrice}
            maxPrice={maxPrice}
            currentMin={filters.priceRange.min}
            currentMax={filters.priceRange.max}
            onChange={handlePriceChange}
          />

          <Separator />

          <StarRatingFilter 
            onChange={handleRatingChange}
            selectedRatings={filters.ratings}
          />

          <Separator />

          <AmenitiesFilter 
            onChange={handleAmenitiesChange}
            selectedAmenities={filters.amenities}
          />
        </div>
      </CardContent>
    </Card>
  )
}
