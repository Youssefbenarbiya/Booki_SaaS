"use client"

import { useState } from "react"
import { CarCard, type Car } from "./CarCard"
import { ChevronDown, LayoutGrid, LayoutList } from "lucide-react"

interface CarListProps {
  cars: Car[]
}

export function CarList({ cars }: CarListProps) {
  const [sortBy, setSortBy] = useState("Recommended")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  if (cars.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars match your filters</h3>
        <p className="text-gray-600">Try adjusting your filter criteria to see more results</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
        <div className="flex gap-1">
          <button
            className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-yellow-400" : "bg-yellow-100"}`}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-yellow-400" : "bg-yellow-100"}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Subheader */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Showing {cars.length} of 297 places</p>
        <div className="relative">
          <button className="flex items-center gap-2 text-sm font-medium">
            Sort by: {sortBy}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Car Grid/List */}
      <div
        className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}
      >
        {cars.map((car) => (
          <CarCard key={car.id} car={car} viewMode={viewMode} />
        ))}
      </div>

      {/* Show More Button */}
      <button className="w-full bg-gray-900 text-white py-3 rounded text-center font-medium hover:bg-gray-800 transition-colors">
        Show more results
      </button>
    </div>
  )
}

