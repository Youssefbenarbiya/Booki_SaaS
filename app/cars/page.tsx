"use client"
import Image from "next/image"
import { useState } from "react"

interface Car {
  id: number
  name: string
  image: string
  price: number
  rating: number
  features: {
    seats: number
    luggage: number
    manual: boolean
  }
}

export default function CarPage() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  
  const cars: Car[] = [
    {
      id: 1,
      name: "Koenigsegg",
      image: "/assets/Car.png", // Replace with actual car image
      price: 99.00,
      rating: 5,
      features: {
        seats: 4,
        luggage: 2,
        manual: true
      }
    },
    {
      id: 2,
      name: "Nissan GT-R",
      image: "/assets/Car.png", // Replace with actual car image
      price: 80.00,
      rating: 4,
      features: {
        seats: 4,
        luggage: 2,
        manual: false
      }
    },
    {
      id: 3,
      name: "Rolls-Royce",
      image: "/assets/Car.png", // Replace with actual car image
      price: 96.00,
      rating: 5,    
      features: {
        seats: 4,
        luggage: 3,
        manual: true
      }
    },
    // Add more cars as needed
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-64 shrink-0">
          <div className="space-y-6">
            {/* Search Box */}
            <div>
              <h3 className="font-semibold mb-2">Where we go?</h3>
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Star Rating Filter */}
            <div>
              <h3 className="font-semibold mb-2">Star Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRating === rating}
                      onChange={() => setSelectedRating(rating)}
                      className="rounded"
                    />
                    <div className="flex gap-1">
                      {Array.from({ length: rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">(123)</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-2">Price Range</h3>
              <input
                type="range"
                min="0"
                max="1000"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Car Type */}
            <div>
              <h3 className="font-semibold mb-2">Type</h3>
              {['Nissan', 'Toyota', 'Mercedes', 'BMW', 'Audi'].map((brand) => (
                <label key={brand} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Showing 1-9 of 200 places</p>
            <select className="border rounded-md px-3 py-2">
              <option>Sort by Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="border rounded-lg overflow-hidden group">
                <div className="relative h-48">
                  <Image
                    src={car.image}
                    alt={car.name}
                    width={500}
                    height={200}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white">
                    ❤️
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{car.name}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">{car.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>👥 {car.features.seats} Seats</span>
                    <span>🧳 {car.features.luggage} Luggage</span>
                    <span>{car.features.manual ? '🔧 Manual' : '🔧 Auto'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">${car.price}</span>
                      <span className="text-gray-600">/day</span>
                    </div>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 