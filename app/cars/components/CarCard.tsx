"use client"

import { Heart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export interface Car {
  id: number
  model: string
  brand: string
  year: number
  plateNumber: string
  color: string
  price: number
  isAvailable: boolean
  images: string[]
  createdAt: Date
  updatedAt: Date | null
}

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/cars/${car.id}/booking`)
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent click
    // Add favorite functionality here
  }

  return (
    <div
      className="border rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        <Image
          src={car.images[0] || "/assets/Car.png"}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors"
          onClick={handleHeartClick}
        >
          <Heart className="h-5 w-5 text-gray-500 hover:text-red-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">
            {car.brand} {car.model}
          </h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 ml-1">{car.year}</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          <span>🎨 {car.color}</span>
          <span>🚘 {car.plateNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">${car.price}</span>
            <span className="text-gray-600">/day</span>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  )
}
