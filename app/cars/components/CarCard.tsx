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
  originalPrice: number
  discountPercentage?: number
  priceAfterDiscount?: number
  images: string[]
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date | null
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

  // Price calculations
  const originalPrice = Number(car.originalPrice) || 0
  const discountPercentage = Number(car.discountPercentage) || 0
  const priceAfterDiscount = Number(car.priceAfterDiscount) || originalPrice
  const hasDiscount =
    discountPercentage > 0 && priceAfterDiscount < originalPrice

  const formatPrice = (price: number) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00"
  }

  // Replace the PriceDisplay component with:
  const PriceDisplay = () => (
    <div>
      {hasDiscount ? (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 line-through">
            ${formatPrice(originalPrice)}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">
              ${formatPrice(priceAfterDiscount)}
            </span>
            <span className="text-xs text-green-600">
              -{discountPercentage}%
            </span>
          </div>
        </div>
      ) : (
        <span className="font-bold text-lg">${formatPrice(originalPrice)}</span>
      )}
      <span className="text-xs text-gray-500">/day</span>
    </div>
  )

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
              <p className="text-xs text-gray-500">Year: {car.year}</p>
              <p className="text-xs text-gray-500">Plate: {car.plateNumber}</p>
              <p className="text-xs text-gray-500">Color: {car.color}</p>
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

          {/* Car Price and Button */}
          <div className="flex justify-between items-center mt-auto">
            <PriceDisplay />
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
          <p className="text-xs text-gray-500">Year: {car.year}</p>
          <p className="text-xs text-gray-500">Plate: {car.plateNumber}</p>
          <p className="text-xs text-gray-500">Color: {car.color}</p>
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

      {/* Car Price and Button */}
      <div className="p-3 flex justify-between items-center">
        <PriceDisplay />
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
