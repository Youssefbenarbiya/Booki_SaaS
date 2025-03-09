"use client"

import { useState, useEffect } from "react"
import { Car } from "./components/CarCard"
import { CarList } from "./components/CarList"
import { CarFilter } from "./components/CarFilter"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function CarPage() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  const cars: Car[] = [
    {
      id: 1,
      brand: "Koenigsegg",
      model: "Agera",
      year: 2021,
      plateNumber: "KNG-001",
      color: "Black",
      price: 99.00,
      isAvailable: true,
      images: ["/assets/Car.png"],
      createdAt: new Date(),
      updatedAt: null
    },
    {
      id: 2,
      brand: "Nissan",
      model: "GT-R",
      year: 2020,
      plateNumber: "GTR-002",
      color: "Blue",
      price: 80.00,
      isAvailable: true,
      images: ["/assets/Car.png"],
      createdAt: new Date(),
      updatedAt: null
    },
    {
      id: 3,
      brand: "Rolls-Royce",
      model: "Phantom",
      year: 2022,
      plateNumber: "RR-003",
      color: "Silver",
      price: 96.00,
      isAvailable: true,
      images: ["/assets/Car.png"],
      createdAt: new Date(),
      updatedAt: null
    },
  ]

  useEffect(() => {
    setFilteredCars(cars)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rent a Car</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        {!isDesktop && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="mb-4 md:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <CarFilter
                carsData={cars}
                setFilteredCars={setFilteredCars}
                isMobileView={true}
              />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Desktop Filter Sidebar */}
        {isDesktop && (
          <div className="w-64 shrink-0">
            <CarFilter
              carsData={cars}
              setFilteredCars={setFilteredCars}
            />
          </div>
        )}

        {/* Car Listings */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Showing {filteredCars.length} cars</p>
            <select className="border rounded-md px-3 py-2">
              <option>Sort by Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          <CarList cars={filteredCars} />
        </div>
      </div>
    </div>
  )
} 