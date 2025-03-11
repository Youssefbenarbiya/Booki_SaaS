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
import { searchCars } from "@/actions/carActions"
import HotelList from "@/components/cards/HotelList"
import { HotelFilter } from "@/components/filter/hotel/HotelFilter"
import { TripFilter } from "@/components/filter/TripFilter"
import { CarList } from "@/app/cars/components/CarList"
import { CarFilter } from "@/app/cars/components/CarFilter"
import { Car } from "@/app/cars/components/CarCard"
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
  pickupLocation?: string
  pickupDate?: string
  returnDate?: string
}

export function SearchResults({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Explicitly type the state arrays
  const [hotelsData, setHotelsData] = useState<Hotel[]>([])
  const [tripsData, setTripsData] = useState<Trip[]>([])
  const [carsData, setCarsData] = useState<Car[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])

  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Fetch data based on search params
  useEffect(() => {
    const fetchData = async () => {
      if (!searchParams.type) {
        setHotelsData([])
        setTripsData([])
        setCarsData([])
        setFilteredHotels([])
        setFilteredTrips([])
        setFilteredCars([])
        setError(null)
        setSearchAttempted(false)
        return
      }

      setLoading(true)
      setError(null)
      setSearchAttempted(true)

      try {
        console.log("Search params:", searchParams)

        if (searchParams.type === "trips") {
          if (!searchParams.destination) {
            setError("Please enter a destination")
            setLoading(false)
            return
          }

          const trips = await searchTrips(
            searchParams.destination,
            searchParams.startDate || ""
          )
          console.log("Trips search results:", trips)
          setTripsData(trips)
          setFilteredTrips(trips)
        } else if (searchParams.type === "hotels") {
          if (!searchParams.city) {
            setError("Please enter a city")
            setLoading(false)
            return
          }

          const hotels = await searchHotels(
            searchParams.city,
            searchParams.checkIn || "",
            searchParams.checkOut || ""
          )
          console.log("Hotels search results:", hotels)
          setHotelsData(hotels)
          setFilteredHotels(hotels)
        } else if (searchParams.type === "rent") {
          if (!searchParams.pickupLocation) {
            setError("Please enter a pickup location")
            setLoading(false)
            return
          }

          const cars = await searchCars(
            searchParams.pickupLocation,
            searchParams.pickupDate || "",
            searchParams.returnDate || ""
          )
          console.log("Cars search results:", cars)
          setCarsData(cars)
          setFilteredCars(cars)
        }
      } catch (err) {
        console.error("Search error:", err)
        setError("An error occurred while searching. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleHotelFilterChange = useCallback(
    (filteredHotels: Hotel[]) => {
      setFilteredHotels(filteredHotels)
    },
    [setFilteredHotels]
  )

  const handleTripFilterChange = useCallback(
    (filteredTrips: Trip[]) => {
      setFilteredTrips(filteredTrips)
    },
    [setFilteredTrips]
  )

  const handleCarFilterChange = useCallback(
    (filteredCars: Car[]) => {
      setFilteredCars(filteredCars)
    },
    [setFilteredCars]
  )

  // Render a no results message
  const renderNoResults = () => {
    if (!searchAttempted) return null

    let message = "No results found"
    let suggestion = "Try different search criteria"

    if (searchParams.type === "trips") {
      message = "No trips found"
      suggestion = "Try a different destination or date"
    } else if (searchParams.type === "hotels") {
      message = "No hotels found"
      suggestion = "Try a different city or dates"
    } else if (searchParams.type === "rent") {
      message = "No cars found"
      suggestion = "Try a different location or dates"
    }

    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600 mb-4">{suggestion}</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    )
  }

  // Render the trip results
  const renderTripResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )
    }

    if (filteredTrips.length === 0) {
      return renderNoResults()
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    )
  }

  // Render the hotel results
  const renderHotelResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )
    }

    if (filteredHotels.length === 0) {
      return renderNoResults()
    }

    return <HotelList hotels={filteredHotels} />
  }

  // Render the car search results
  const renderCarResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )
    }

    if (filteredCars.length === 0) {
      return renderNoResults()
    }

    return <CarList cars={filteredCars} />
  }

  // Determine what type of results to display
  const renderResults = () => {
    if (!searchParams.type || !searchParams.type.trim()) {
      return null
    }

    switch (searchParams.type) {
      case "trips":
        return renderTripResults()
      case "hotels":
        return renderHotelResults()
      case "rent":
        return renderCarResults()
      default:
        return null
    }
  }

  if (!searchParams.type) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {searchParams.type === "trips"
            ? "Trips"
            : searchParams.type === "hotels"
            ? "Hotels"
            : searchParams.type === "rent"
            ? "Cars"
            : "Search"}{" "}
          Results
        </h2>

        {isDesktop ? (
          <div className="flex gap-8">
            {/* Sidebar filters */}
            {searchParams.type === "hotels" && (
              <div className="w-64">
                <HotelFilter
                  hotelsData={hotelsData}
                  setFilteredHotels={setFilteredHotels}
                  onFilterChange={handleHotelFilterChange}
                />
              </div>
            )}
            {searchParams.type === "trips" && (
              <div className="w-64">
                <TripFilter
                  tripsData={tripsData}
                  setFilteredTrips={setFilteredTrips}
                />
              </div>
            )}
            {searchParams.type === "rent" && (
              <div className="w-64">
                <CarFilter
                  carsData={carsData}
                  setFilteredCars={setFilteredCars}
                  onFilterChange={handleCarFilterChange}
                  searchParams={searchParams}
                />
              </div>
            )}

            {/* Main content */}
            <div className="flex-1">{renderResults()}</div>
          </div>
        ) : (
          <div>
            {/* Mobile view with sheet for filters */}
            <div className="mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="mb-4">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  {searchParams.type === "hotels" && (
                    <HotelFilter
                      hotelsData={hotelsData}
                      setFilteredHotels={setFilteredHotels}
                      onFilterChange={handleHotelFilterChange}
                    />
                  )}
                  {searchParams.type === "trips" && (
                    <TripFilter
                      tripsData={tripsData}
                      setFilteredTrips={setFilteredTrips}
                    />
                  )}
                  {searchParams.type === "rent" && (
                    <CarFilter
                      carsData={carsData}
                      setFilteredCars={setFilteredCars}
                      onFilterChange={handleCarFilterChange}
                      isMobileView={true}
                      searchParams={searchParams}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Results */}
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  )
}
