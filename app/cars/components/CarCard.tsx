"use client"

import type React from "react"

import { Heart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useFavorite } from "@/lib/hooks/useFavorite"

export interface Car {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  price: number
  originalPrice?: number
  isAvailable: boolean
  images: string[]
  createdAt: Date
  updatedAt: Date | null
  type?: string
  fuelType?: string
  transmission?: string
  capacity?: number
}

interface CarCardProps {
  car: Car
  viewMode: "grid" | "list"
}

export function CarCard({ car, viewMode }: CarCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite, isLoading } = useFavorite(car.id, "car")

  const handleCardClick = () => {
    router.push(`/cars/${car.id}/booking`)
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation() 
    toggleFavorite()
  }

  const carType = car.type || "Sport"
  const fuelType = car.fuelType || "70L"
  const transmission = car.transmission || "Manual"
  const capacity = car.capacity || 2

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg overflow-hidden flex">
        {/* Car Image */}
        <div className="relative h-48 w-72 flex-shrink-0">
          <Image
            src={car.images[0] || "/assets/Car.png"}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col flex-grow p-4">
          {/* Car Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800">
                {car.brand} {car.model}
              </h3>
              <p className="text-xs text-gray-500">{carType}</p>
            </div>
            <button
              onClick={handleHeartClick}
              className="focus:outline-none"
              disabled={isLoading}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"
                }`}
              />
            </button>
          </div>

          {/* Car Details */}
          <div className="flex gap-6 text-xs text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <div className="bg-blue-100 p-1 rounded-full">
                <span className="text-blue-500">⛽</span>
              </div>
              <span>{fuelType}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="bg-blue-100 p-1 rounded-full">
                <span className="text-blue-500">🔄</span>
              </div>
              <span>{transmission}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="bg-blue-100 p-1 rounded-full">
                <span className="text-blue-500">👤</span>
              </div>
              <span>{capacity} People</span>
            </div>
          </div>

          {/* Car Price and Button */}
          <div className="flex justify-between items-center mt-auto">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-lg">
                  ${car.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">/day</span>
              </div>
              {car.originalPrice && (
                <span className="text-xs text-gray-500">
                  ${car.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleCardClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Car Header */}
      <div className="flex justify-between items-center p-3">
        <div>
          <h3 className="font-bold text-gray-800">
            {car.brand} {car.model}
          </h3>
          <p className="text-xs text-gray-500">{carType}</p>
        </div>
        <button
          onClick={handleHeartClick}
          className="focus:outline-none"
          disabled={isLoading}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"
            }`}
          />
        </button>
      </div>

      {/* Car Image */}
      <div className="relative h-32 w-full">
        <Image
          src={car.images[0] || "/assets/Car.png"}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-contain"
        />
      </div>

      {/* Car Details */}
      <div className="p-3 flex justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1 rounded-full">
            <span className="text-blue-500">⛽</span>
          </div>
          <span>{fuelType}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1 rounded-full">
            <span className="text-blue-500">🔄</span>
          </div>
          <span>{transmission}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1 rounded-full">
            <span className="text-blue-500">👤</span>
          </div>
          <span>{capacity} People</span>
        </div>
      </div>

      {/* Car Price and Button */}
      <div className="p-3 flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg">${car.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500">/day</span>
          </div>
          {car.originalPrice && (
            <span className="text-xs text-gray-500">
              ${car.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleCardClick}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Rent Now
        </button>
      </div>
    </div>
  )
}
