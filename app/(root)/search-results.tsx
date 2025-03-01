/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { searchTrips } from "@/actions/searchTrips"
import { searchHotels } from "@/actions/searchHotels"
import TripList from "@/components/cards/TripList"
import HotelList from "@/components/cards/HotelList"
import { HotelFilter } from "@/components/filter/HotelFilter"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SearchParams {
  type?: string
  destination?: string
  startDate?: string
  city?: string
  checkIn?: string
  checkOut?: string
}

export function SearchResults({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [hotelsData, setHotelsData] = useState([])
  const [tripsData, setTripsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredHotels, setFilteredHotels] = useState([])

  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Fetch data based on search params
  useEffect(() => {
    const fetchData = async () => {
      if (!searchParams.type) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        if (
          searchParams.type === "trips" &&
          searchParams.destination &&
          searchParams.startDate
        ) {
          const trips = await searchTrips(
            searchParams.destination,
            searchParams.startDate
          )
          setTripsData(trips)
        }

        if (
          searchParams.type === "hotels" &&
          searchParams.city &&
          searchParams.checkIn &&
          searchParams.checkOut
        ) {
          const hotels = await searchHotels(
            searchParams.city,
            searchParams.checkIn,
            searchParams.checkOut
          )
          setHotelsData(hotels)
          setFilteredHotels(hotels)
        }
      } catch (err) {
        setError("An error occurred while fetching search results.")
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleFilterChange = (filters: any) => {
    // Apply filters to hotel data
    // This is a simple client-side implementation
    // In a real app, you might want to fetch filtered data from the server

    const filtered = hotelsData.filter((hotel) => {
      // Filter by price
      const minPrice = Math.min(
        ...hotel.rooms.map((r) => Number(r.pricePerNight))
      )
      if (
        minPrice < filters.priceRange.min ||
        minPrice > filters.priceRange.max
      ) {
        return false
      }

      // Filter by ratings
      if (
        filters.ratings.length > 0 &&
        !filters.ratings.includes(Math.floor(hotel.rating))
      ) {
        return false
      }

      // For amenities, we would need a proper amenities field on hotels
      // This is just a placeholder implementation

      return true
    })

    setFilteredHotels(filtered)
  }

  if (!searchParams.type) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (searchParams.type === "trips" && tripsData.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            No trips found
          </h2>
          <p className="mt-2 text-gray-600">
            Try adjusting your search criteria to find more results
          </p>
        </div>
      </div>
    )
  }

  if (searchParams.type === "trips" && tripsData.length > 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="py-8">
          <h2 className="text-2xl font-semibold mb-6">
            Found {tripsData.length} trips for your search
          </h2>
          <TripList trips={tripsData} />
        </div>
      </div>
    )
  }

  if (searchParams.type === "hotels") {
    if (filteredHotels.length === 0) {
      return (
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              No hotels found
            </h2>
            <p className="mt-2 text-gray-600">
              Try adjusting your search criteria to find more results
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">
          Found {filteredHotels.length} hotels in {searchParams.city}
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Button & Sheet */}
          {!isDesktop && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 md:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] pt-6 px-0">
                <HotelFilter
                  onFilterChange={handleFilterChange}
                  isMobileView={true}
                  className="border-0 shadow-none"
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Filter Sidebar */}
          {isDesktop && (
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24">
                <HotelFilter onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Hotel Results */}
          <div className="flex-1">
            <HotelList hotels={filteredHotels} />
          </div>
        </div>
      </div>
    )
  }

  return null
}
