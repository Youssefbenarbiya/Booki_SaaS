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
import { HotelFilter } from "@/components/filter/HotelFilter"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])

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

        if (
          searchParams.type === "rent" &&
          searchParams.pickupLocation &&
          searchParams.pickupDate &&
          searchParams.returnDate
        ) {
          const cars = await searchCars(
            searchParams.pickupLocation,
            searchParams.pickupDate,
            searchParams.returnDate
          )
          setCarsData(cars)
          setFilteredCars(cars)
        }
      } catch (err) {
        setError("Error fetching data")
        console.error(err)
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
