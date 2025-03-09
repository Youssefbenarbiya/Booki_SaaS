"use client"

import { useState, useEffect } from "react"
import { Car } from "./CarCard"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CarFilterProps {
  carsData: Car[]
  setFilteredCars: (cars: Car[]) => void
  onFilterChange?: (filteredCars: Car[]) => void
  isMobileView?: boolean
  className?: string
  searchParams?: Record<string, string>
}

export function CarFilter({
  carsData,
  setFilteredCars,
  onFilterChange,
  isMobileView = false,
  className = "",
  searchParams,
}: CarFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableOnly, setAvailableOnly] = useState(true)

  // Extract unique brands from car data
  const carBrands = Array.from(new Set(carsData.map((car) => car.brand)))

  // Find min and max price in the data
  const minPrice = Math.min(...carsData.map((car) => car.price), 0)
  const maxPrice = Math.max(...carsData.map((car) => car.price), 1000)

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  // Apply filters
  useEffect(() => {
    let filtered = [...carsData]

    // Filter by availability
    if (availableOnly) {
      filtered = filtered.filter((car) => car.isAvailable)
    }

    // Filter by price range
    filtered = filtered.filter(
      (car) => car.price >= priceRange[0] && car.price <= priceRange[1]
    )

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((car) => selectedBrands.includes(car.brand))
    }

    setFilteredCars(filtered)
    
    // Call onFilterChange if provided
    if (onFilterChange) {
      onFilterChange(filtered)
    }
  }, [carsData, priceRange, selectedBrands, availableOnly, setFilteredCars, onFilterChange])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    )
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6 ${className}`}
    >
      <div>
        <h3 className="font-semibold mb-4">Availability</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="available"
            checked={availableOnly}
            onCheckedChange={() => setAvailableOnly(!availableOnly)}
          />
          <Label htmlFor="available">Show only available cars</Label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[minPrice, maxPrice]}
          max={maxPrice}
          min={minPrice}
          step={10}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Brand</h3>
        <div className="space-y-2">
          {carBrands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`}>{brand}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 