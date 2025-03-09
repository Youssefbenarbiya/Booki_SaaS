"use client"

import { CarCard, Car } from "./CarCard"

interface CarListProps {
  cars: Car[]
}

export function CarList({ cars }: CarListProps) {
  if (cars.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No cars match your filters
        </h3>
        <p className="text-gray-600">
          Try adjusting your filter criteria to see more results
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  )
} 