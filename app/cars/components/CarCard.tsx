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

  // Price calculations - explicitly use values from database
  const originalPrice = Number(car.originalPrice) || 0
  const discountPercentage = car.discountPercentage ? Number(car.discountPercentage) : 0
  const priceAfterDiscount = car.priceAfterDiscount ? Number(car.priceAfterDiscount) : originalPrice
  
  // Debug the discount values from database in console
  console.log(`Car ${car.id} discount data:`, {
    originalPrice,
    discountPercentage,
    priceAfterDiscount,
    hasDiscount: discountPercentage > 0 && priceAfterDiscount < originalPrice
  })
  
  const hasDiscount = discountPercentage > 0 && priceAfterDiscount < originalPrice

  const formatPrice = (price: number) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00"
  }

  // Enhanced PriceDisplay component to show all pricing information
  const PriceDisplay = () => (
    <div>
      {/* Always show the original price */}
      <div className="flex items-center gap-2">
        <span className={hasDiscount ? "text-xs text-gray-500 line-through" : "font-bold text-lg"}>
          ${formatPrice(originalPrice)}
        </span>
        
        {hasDiscount && (
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
      
      {/* Show discounted price if available */}
      {hasDiscount && (
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg text-green-600">
            ${formatPrice(priceAfterDiscount)}
          </span>
        </div>
      )}
      
      <span className="text-xs text-gray-500">/day</span>
    </div>
  )

  // Add a discount badge to the car image section for list view
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg overflow-hidden flex border hover:shadow-md transition-shadow">
        {/* Car Image */}
        <div className="relative h-48 w-72 flex-shrink-0">
          <Image
            src={car.images[0] || "/assets/Car.png"}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {discountPercentage}% OFF
            </div>
          )}
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
    <div className="bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
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
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discountPercentage}% OFF
          </div>
        )}
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
