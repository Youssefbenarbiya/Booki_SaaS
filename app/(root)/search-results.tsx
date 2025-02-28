import { searchTrips } from "@/actions/searchTrips"
import { searchHotels } from "@/actions/searchHotels"
import TripList from "@/components/cards/TripList"
import HotelList from "@/components/cards/HotelList"

interface SearchParams {
  type?: string
  destination?: string
  startDate?: string
  city?: string
  checkIn?: string
  checkOut?: string
}

export async function SearchResults({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // If no search parameters are provided, don't show any results
  if (!searchParams.type) {
    return null
  }

  try {
    if (
      searchParams.type === "trips" &&
      searchParams.destination &&
      searchParams.startDate
    ) {
      const trips = await searchTrips(
        searchParams.destination,
        searchParams.startDate
      )

      if (trips.length === 0) {
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

      return (
        <div className="container mx-auto px-4">
          <div className="py-8">
            <h2 className="text-2xl font-semibold mb-6">
              Found {trips.length} trips for your search
            </h2>
            <TripList trips={trips} />
          </div>
        </div>
      )
    }

    if (
      searchParams.type === "hotels" &&
      searchParams.city &&
      searchParams.checkIn &&
      searchParams.checkOut
    ) {
      console.log("Hotel search params:", searchParams)

      const hotels = await searchHotels(
        searchParams.city,
        searchParams.checkIn,
        searchParams.checkOut
      )

      console.log(`Search returned ${hotels.length} hotels`)

      if (hotels.length === 0) {
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
        <div className="container mx-auto px-4">
          <div className="py-8">
            <h2 className="text-2xl font-semibold mb-6">
              Found {hotels.length} hotels for your search
            </h2>
            <HotelList hotels={hotels} />
          </div>
        </div>
      )
    }

    return null
  } catch (error) {
    console.error("Search error:", error)
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }
}
