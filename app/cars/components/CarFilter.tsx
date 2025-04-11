"use client"

import { useState, useEffect } from "react"
import type { Car } from "./CarCard"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { searchCars } from "@/actions/cars/carActions"

interface CarFilterProps {
  carsData: Car[]
  setFilteredCars: (cars: Car[]) => void
  onFilterChange?: (filteredCars: Car[]) => void
  isMobileView?: boolean
  className?: string
  searchParams?: Record<string, string>
}

// Helper function to calculate display price
function getDisplayPrice(car: Car): number {
  const originalPrice =
    typeof car.originalPrice === "string"
      ? parseFloat(car.originalPrice)
      : car.originalPrice
  const priceAfterDiscount =
    car.priceAfterDiscount !== undefined
      ? typeof car.priceAfterDiscount === "string"
        ? parseFloat(car.priceAfterDiscount)
        : car.priceAfterDiscount
      : undefined
  return priceAfterDiscount ?? originalPrice
}

export function CarFilter({
  carsData,
  setFilteredCars,
  onFilterChange,
  className = "",
  searchParams = {},
}: CarFilterProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  // Extract unique values from car data
  const carBrands = Array.from(new Set(carsData.map((car) => car.brand)))
  const carCategories = Array.from(new Set(carsData.map((car) => car.category))).filter(Boolean)
  const carLocations = Array.from(new Set(carsData.map((car) => car.location))).filter(Boolean)

  // Price calculations
  const prices = carsData.map((car) => getDisplayPrice(car))
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 1000

  // State variables
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [availableOnly, setAvailableOnly] = useState(true)
  const [fromLocation, setFromLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    brand: false,
    category: true,
    capacity: true,
    location: false,
  })

  // Initialize location from URL params if available
  useEffect(() => {
    const pickupLocation = urlSearchParams.get('pickupLocation');
    if (pickupLocation) {
      setFromLocation(pickupLocation);
    }
  }, [urlSearchParams]);

  // Update price range when min/max changes
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
    filtered = filtered.filter((car) => {
      const price = getDisplayPrice(car)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((car) => selectedBrands.includes(car.brand))
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((car) => selectedCategories.includes(car.category))
    }
    
    // Filter by selected locations
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((car) => selectedLocations.includes(car.location))
    }
    
    // Filter by selected seats
    if (selectedSeats.length > 0) {
      filtered = filtered.filter((car) => selectedSeats.includes(car.seats))
    }
    
    // Filter by location text (if no specific locations are selected)
    if (fromLocation && selectedLocations.length === 0) {
      filtered = filtered.filter((car) => 
        car.location.toLowerCase().includes(fromLocation.toLowerCase())
      )
    }

    setFilteredCars(filtered)

    // Call onFilterChange if provided
    if (onFilterChange) {
      onFilterChange(filtered)
    }
  }, [
    carsData,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedLocations,
    selectedSeats,
    availableOnly,
    fromLocation,
    setFilteredCars,
    onFilterChange,
  ])

  // Toggle functions for filters
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }
  
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }
  
  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    )
  }
  
  const toggleSeat = (seat: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    )
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Handle search by location
  const handleSearch = async () => {
    if (!fromLocation.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Update the URL query params to include the search location
      const params = new URLSearchParams(searchParams);
      params.set('pickupLocation', fromLocation.trim());
      
      // Get current date and tomorrow's date in ISO format for pickup/return dates
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      params.set('pickupDate', searchParams.pickupDate || today);
      params.set('returnDate', searchParams.returnDate || tomorrow);
      
      // Update the URL without refreshing the page
      router.push(`/cars?${params.toString()}`);
      
      // You can also directly call the searchCars function to update the results immediately
      // This is optional if you're handling the search server-side
      // const results = await searchCars(fromLocation.trim(), today, tomorrow);
      // if (results && results.length > 0) {
      //   setFilteredCars(results);
      // }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-[#e0e10a] rounded-t-lg p-4 text-center relative">
        <div className="absolute w-4 h-4 bg-[#e0e10a] rotate-45 left-1/2 -bottom-2 -translate-x-1/2"></div>
        <h2 className="font-bold text-lg">Find Your Rental Car</h2>
      </div>

      {/* Search Form */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs font-medium mb-1">PICKUP LOCATION</p>
          <Input
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="border border-gray-300"
            placeholder="Airport, city, address..."
          />
        </div>
        <Button
          className="w-full bg-[#e0e10a] hover:bg-[#c5c609] text-black font-semibold"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> SEARCH
            </>
          )}
        </Button>
      </div>

      <div className="border-t border-gray-200 mx-4 my-2"></div>

      {/* Filters Header */}
      <div className="px-4 py-2">
        <h3 className="font-semibold text-lg">Filters</h3>
      </div>

      <div className="border-t border-gray-200 mx-4 mb-4"></div>

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

      {/* Brand Section */}
      <div className="px-4 mb-4">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("brand")}
        >
          <h3 className="font-semibold">Brand</h3>
          {expandedSections.brand ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {expandedSections.brand && (
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
          {expandedSections.category ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {expandedSections.category && (
          <div className="space-y-2">
            {carCategories.length > 0 ? (
              carCategories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-suv" onCheckedChange={() => toggleCategory("SUV")} />
                  <Label htmlFor="category-suv">SUV</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-economy" onCheckedChange={() => toggleCategory("Economy")} />
                  <Label htmlFor="category-economy">Economy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-midsize" onCheckedChange={() => toggleCategory("Midsize")} />
                  <Label htmlFor="category-midsize">Midsize</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-luxury" onCheckedChange={() => toggleCategory("Luxury")} />
                  <Label htmlFor="category-luxury">Luxury</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-electric" onCheckedChange={() => toggleCategory("Electric")} />
                  <Label htmlFor="category-electric">Electric</Label>
                </div>
              </>
            )}
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
          {expandedSections.capacity ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {expandedSections.capacity && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="capacity-2" 
                checked={selectedSeats.includes(2)}
                onCheckedChange={() => toggleSeat(2)}
              />
              <Label htmlFor="capacity-2">2 persons</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="capacity-4" 
                checked={selectedSeats.includes(4)}
                onCheckedChange={() => toggleSeat(4)}
              />
              <Label htmlFor="capacity-4">4 persons</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="capacity-5" 
                checked={selectedSeats.includes(5)}
                onCheckedChange={() => toggleSeat(5)}
              />
              <Label htmlFor="capacity-5">5 persons</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="capacity-7" 
                checked={selectedSeats.includes(7)}
                onCheckedChange={() => toggleSeat(7)}
              />
              <Label htmlFor="capacity-7">7 persons</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="capacity-8plus" 
                onCheckedChange={() => {
                  const hasEight = selectedSeats.some(s => s >= 8);
                  if (hasEight) {
                    setSelectedSeats(prev => prev.filter(s => s < 8));
                  } else {
                    setSelectedSeats(prev => [...prev, 8]);
                  }
                }}
                checked={selectedSeats.some(s => s >= 8)}
              />
              <Label htmlFor="capacity-8plus">8 or More</Label>
            </div>
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="px-4 mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("location")}
        >
          <h3 className="font-semibold">Pickup Locations</h3>
          {expandedSections.location ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {expandedSections.location && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {carLocations.length > 0 ? (
              carLocations.map((location) => (
                <div key={location} className="flex items-center gap-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={selectedLocations.includes(location)}
                    onCheckedChange={() => toggleLocation(location)}
                  />
                  <Label htmlFor={`location-${location}`} className="text-sm truncate">{location}</Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No locations available</p>
            )}
          </div>
        )}
      </div>

      {/* Availability (kept from original but hidden) */}
      <div className="hidden">
        <div className="flex items-center gap-2">
          <Checkbox
            id="available"
            checked={availableOnly}
            onCheckedChange={() => setAvailableOnly(!availableOnly)}
          />
          <Label htmlFor="available">Show only available cars</Label>
        </div>
      </div>
    </div>
  )
}
