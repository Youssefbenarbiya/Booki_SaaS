"use client"

import { useState, useEffect } from "react"
import type { Car } from "./CarCard"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star } from "lucide-react"

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
  className = "",
  searchParams,
}: CarFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableOnly, setAvailableOnly] = useState(true)
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [starRating, setStarRating] = useState<number[]>([])
  const [expandedSections, setExpandedSections] = useState({
    type: false,
    category: false,
    capacity: false,
  })

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
    filtered = filtered.filter((car) => car.price >= priceRange[0] && car.price <= priceRange[1])

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
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const toggleStarRating = (rating: number) => {
    setStarRating((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const toggleSection = (section: "type" | "category" | "capacity") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleSearch = () => {
    // This would handle the search functionality
    console.log("Searching from", fromLocation, "to", toLocation)
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-[#e0e10a] rounded-t-lg p-4 text-center relative">
        <div className="absolute w-4 h-4 bg-[#e0e10a] rotate-45 left-1/2 -bottom-2 -translate-x-1/2"></div>
        <h2 className="font-bold text-lg">Where we go ?</h2>
      </div>

      {/* Search Form */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs font-medium mb-1">FROM ?</p>
          <Input
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="border border-gray-300"
          />
        </div>
        <div>
          <p className="text-xs font-medium mb-1">WHERE ?</p>
          <Input
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="border border-gray-300"
          />
        </div>
        <Button className="w-full bg-[#e0e10a] hover:bg-[#c5c609] text-black font-semibold" onClick={handleSearch}>
          SEARCH
        </Button>
      </div>

      <div className="border-t border-gray-200 mx-4 my-2"></div>

      {/* Filters Header */}
      <div className="px-4 py-2">
        <h3 className="font-semibold text-lg">Filters</h3>
      </div>

      <div className="border-t border-gray-200 mx-4 mb-4"></div>

      {/* Star Rating */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold mb-3">Star Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`star-${rating}`}
                checked={starRating.includes(rating)}
                onCheckedChange={() => toggleStarRating(rating)}
              />
              <Label htmlFor={`star-${rating}`} className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating} Star</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold mb-3">Price Range</h3>
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

      {/* Type Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection("type")}>
          <h3 className="font-semibold">Type</h3>
          {expandedSections.type ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.type && (
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
        )}
      </div>

      <div className="border-t border-gray-200 mx-4 mb-4"></div>

      {/* Category Section */}
      <div className="px-4 mb-4">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("category")}
        >
          <h3 className="font-semibold">Category</h3>
          {expandedSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.category && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="category-a" />
              <Label htmlFor="category-a">Véhicules catégorie A</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="category-b" />
              <Label htmlFor="category-b">Véhicules catégorie B</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="category-c" />
              <Label htmlFor="category-c">Véhicules catégorie C</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="category-d" />
              <Label htmlFor="category-d">Véhicules catégorie D</Label>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mx-4 mb-4"></div>

      {/* Capacity Section */}
      <div className="px-4 mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("capacity")}
        >
          <h3 className="font-semibold">Capacity</h3>
          {expandedSections.capacity ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {expandedSections.capacity && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="capacity-2" />
              <Label htmlFor="capacity-2">2 person</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="capacity-4" />
              <Label htmlFor="capacity-4">4 person</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="capacity-6" />
              <Label htmlFor="capacity-6">6 person</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="capacity-8" />
              <Label htmlFor="capacity-8">8 or More</Label>
            </div>
          </div>
        )}
      </div>

      {/* Availability (kept from original but hidden) */}
      <div className="hidden">
        <div className="flex items-center gap-2">
          <Checkbox id="available" checked={availableOnly} onCheckedChange={() => setAvailableOnly(!availableOnly)} />
          <Label htmlFor="available">Show only available cars</Label>
        </div>
      </div>
    </div>
  )
}

