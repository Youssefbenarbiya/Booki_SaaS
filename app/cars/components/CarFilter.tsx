"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Car } from "./CarCard"
import { useRouter, useSearchParams } from "next/navigation"

interface CarFilterProps {
  carsData: Car[]
  setFilteredCars: React.Dispatch<React.SetStateAction<Car[]>>
  onFilterChange?: (filteredCars: Car[]) => void
  isMobileView?: boolean
  searchParams: {
    pickupLocation: string
    pickupDate: string
    returnDate: string
  }
}

// Define the car categories
const CAR_CATEGORIES = [
  { id: "economy", label: "Economy" },
  { id: "midsize", label: "Midsize" },
  { id: "suv", label: "SUV" },
  { id: "luxury", label: "Luxury" },
  { id: "electric", label: "Electric" },
]

export function CarFilter({
  carsData,
  setFilteredCars,
  onFilterChange,
  isMobileView = false,
  searchParams,
}: CarFilterProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.pickupLocation || "")
  const MIN_PRICE = 0
  const MAX_PRICE = 5000
  const [priceRange, setPriceRange] = useState<[number, number]>([
    MIN_PRICE,
    MAX_PRICE,
  ])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Apply filters function
  const applyFilters = () => {
    const filtered = carsData.filter((car) => {
      // Location filter
      const locationMatch =
        location === "" ||
        (car.location &&
          car.location.toLowerCase().includes(location.toLowerCase()))

      // Improved price filter handling
      const price =
        car.priceAfterDiscount !== null
          ? car.priceAfterDiscount
          : car.originalPrice
      const priceValue = typeof price === "string" ? parseFloat(price) : price
      const priceMatch =
        typeof priceValue === "number" &&
        !isNaN(priceValue) &&
        priceValue >= priceRange[0] &&
        priceValue <= priceRange[1]

      // Category filter
      const categoryMatch =
        selectedCategories.length === 0 ||
        (car.category &&
          selectedCategories.includes(car.category.toLowerCase()))

      return locationMatch && priceMatch && categoryMatch
    })

    setFilteredCars(filtered)
    if (onFilterChange) {
      onFilterChange(filtered)
    }
  }

  // Update search parameters with new location
  const updateSearchParams = (newLocation: string) => {
    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(urlSearchParams.toString())

    // Update the location parameter
    params.set("pickupLocation", newLocation)

    // Keep the existing type parameter
    if (!params.has("type")) {
      params.set("type", "rent")
    }

    // Preserve pickup and return dates
    if (searchParams.pickupDate) {
      params.set("pickupDate", searchParams.pickupDate)
    }
    if (searchParams.returnDate) {
      params.set("returnDate", searchParams.returnDate)
    }

    // Navigate to the updated URL without a full page reload
    router.push(`/?${params.toString()}`)
  }

  // Handle location change and search
  const handleLocationChange = () => {
    updateSearchParams(location)
    applyFilters()
  }

  // Apply filters when search params or filter values change
  useEffect(() => {
    applyFilters()
  }, [location, priceRange, selectedCategories, carsData])

  // Update location from search params when they change
  useEffect(() => {
    if (searchParams.pickupLocation !== location) {
      setLocation(searchParams.pickupLocation)
    }
  }, [searchParams.pickupLocation])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <Card className={isMobileView ? "w-full" : ""}>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Search by location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Button onClick={handleLocationChange} size="sm">
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={100}
                value={priceRange}
                onValueChange={(value: number[]) => {
                  setPriceRange([value[0], value[1]])
                  applyFilters()
                }}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Car Category</Label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {CAR_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(
                      category.id.toLowerCase()
                    )}
                    onCheckedChange={() =>
                      handleCategoryToggle(category.id.toLowerCase())
                    }
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
