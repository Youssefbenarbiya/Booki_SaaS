/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
interface Trip {
  id: number
  name: string
  createdAt: Date | null
  updatedAt: Date | null
  description: string | null
  destination: string
  startDate: string
  endDate: string
  price: string
  capacity: number
  isAvailable: boolean | null
  images: any[]
  activities: any[]
}

interface Hotel {
  id: string
  name: string
  address: string
  createdAt: Date
  updatedAt: Date
  description: string
  images: string[]
  city: string
  country: string
  rating: number
  amenities: string[]
  rooms: any[]
}

import { useState, useEffect, useCallback } from "react"
import { searchTrips } from "@/actions/searchTrips"
import { searchHotels } from "@/actions/searchHotels"
import HotelList from "@/components/cards/HotelList"
import { HotelFilter } from "@/components/filter/HotelFilter"
import { TripFilter } from "@/components/filter/TripFilter"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import TripCard from "@/components/cards/TripCard"

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
  // Explicitly type the state arrays
  const [hotelsData, setHotelsData] = useState<Hotel[]>([])
  const [tripsData, setTripsData] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])

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
          setFilteredTrips(trips)
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

  const handleHotelFilterChange = useCallback(
    (filters: any) => {
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
    },
    [hotelsData]
  )

  const handleTripFilterChange = useCallback(
    (filters: any) => {
      const filtered = tripsData.filter((trip) => {
        // Filter by price
        const tripPrice = Number(trip.price)
        if (
          tripPrice < filters.priceRange.min ||
          tripPrice > filters.priceRange.max
        ) {
          return false
        }

        // Filter by duration
        const startDate = new Date(trip.startDate)
        const endDate = new Date(trip.endDate)
        const durationDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (
          durationDays < filters.duration.min ||
          durationDays > filters.duration.max
        ) {
          return false
        }

        // Filter by ratings - assuming trips have a rating property
        if (
          filters.ratings.length > 0 &&
          trip.rating &&
          !filters.ratings.includes(Math.floor(trip.rating))
        ) {
          return false
        }

        // Filter by amenities - assuming trip activities can be matched with amenities
        if (filters.amenities.length > 0) {
          // This is simplified and would need to be adjusted based on your actual data structure
          const tripAmenities = trip.activities.map((a: any) =>
            a.activityName.toLowerCase()
          )
          const hasAllRequiredAmenities = filters.amenities.every(
            (amenity: string) =>
              tripAmenities.some((a: string) =>
                a.includes(amenity.toLowerCase())
              )
          )

          if (!hasAllRequiredAmenities) {
            return false
          }
        }

        // Filter by categories - assuming trips have a category property
        if (
          filters.categories.length > 0 &&
          trip.category &&
          !filters.categories.includes(trip.category)
        ) {
          return false
        }

        return true
      })

      setFilteredTrips(filtered)
    },
    [tripsData]
  )

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

  if (searchParams.type === "trips") {
    // Remove the early return when no trips are found to keep sidebar visible
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">
          {filteredTrips.length > 0
            ? `Found ${filteredTrips.length} trips for your search`
            : "No trips match your filters"}
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Button & Sheet */}
          {!isDesktop && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 md:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter Trips
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] pt-6 px-0">
                <TripFilter
                  onFilterChange={handleTripFilterChange}
                  isMobileView={true}
                  className="border-0 shadow-none"
                  searchParams={searchParams}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Filter Sidebar */}
          {isDesktop && (
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24">
                <TripFilter
                  onFilterChange={handleTripFilterChange}
                  searchParams={searchParams}
                />
              </div>
            </div>
          )}

          {/* Trip Results or Empty State */}
          <div className="flex-1">
            {filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center h-60 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No trips match your filters
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filter criteria to see more results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (searchParams.type === "hotels") {
    // Existing hotel search results code
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">
          {hotelsData.length > 0
            ? `Found ${filteredHotels.length} hotels in ${searchParams.city}`
            : "No hotels found for your search criteria"}
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
                  onFilterChange={handleHotelFilterChange}
                  isMobileView={true}
                  className="border-0 shadow-none"
                  searchParams={searchParams}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Filter Sidebar */}
          {isDesktop && (
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24">
                <HotelFilter
                  onFilterChange={handleHotelFilterChange}
                  searchParams={searchParams}
                />
              </div>
            </div>
          )}

          {/* Hotel Results or Empty State */}
          <div className="flex-1">
            {filteredHotels.length > 0 ? (
              <HotelList hotels={filteredHotels} />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hotels match your filters
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filter criteria to see more results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
