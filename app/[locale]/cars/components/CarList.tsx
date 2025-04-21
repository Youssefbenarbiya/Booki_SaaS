"use client"

import { useState } from "react"
import { CarCard, type Car } from "./CarCard"
import {  LayoutGrid, LayoutList } from "lucide-react"

interface CarListProps {
  cars: Car[]
}

export function CarList({ cars }: CarListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  console.log("CarList received cars:", cars) // Debug log

  if (!Array.isArray(cars) || cars.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No cars available
        </h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Available Cars ({cars.length})
        </h1>
        <div className="flex gap-1">
          <button
            className={`p-2 rounded transition-colors ${
              viewMode === "list" ? "bg-yellow-400" : "bg-yellow-100"
            }`}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className={`p-2 rounded transition-colors ${
              viewMode === "grid" ? "bg-yellow-400" : "bg-yellow-100"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Car Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {cars.map((car) => (
          <CarCard key={car.id} car={car} viewMode={viewMode} />
        ))}
      </div>

      {cars.length > 9 && (
        <button className="w-full bg-gray-900 text-white py-3 rounded text-center font-medium hover:bg-gray-800 transition-colors">
          Show more results
        </button>
      )}
    </div>
  )
}
