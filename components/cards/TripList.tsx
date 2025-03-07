/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import TripCard from "./TripCard"
import TripCardSkeleton from "./TripCardSkeleton"

interface TripListProps {
  trips: any[]
  isLoading?: boolean
}

export default function TripList({ trips, isLoading = false }: TripListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No trips found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria to see more results
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}
