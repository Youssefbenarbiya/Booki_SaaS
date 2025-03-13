"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface PriceRangeFilterProps {
  minPrice: number
  maxPrice: number
  currentMin: number
  currentMax: number
  onChange: (min: number, max: number) => void
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onChange,
}: PriceRangeFilterProps) {
  const [priceRange, setPriceRange] = useState([currentMin, currentMax])

  useEffect(() => {
    setPriceRange([currentMin, currentMax])
  }, [currentMin, currentMax])

  const handleSliderChange = (values: number[]) => {
    setPriceRange(values)
    onChange(values[0], values[1])
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minPrice
    if (value <= priceRange[1] && value >= minPrice) {
      const newRange = [value, priceRange[1]]
      setPriceRange(newRange)
      onChange(newRange[0], newRange[1])
    }
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxPrice
    if (value >= priceRange[0] && value <= maxPrice) {
      const newRange = [priceRange[0], value]
      setPriceRange(newRange)
      onChange(newRange[0], newRange[1])
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Price Range (per night)</h3>

      <Slider
        value={priceRange}
        min={minPrice}
        max={maxPrice}
        step={10}
        onValueChange={handleSliderChange}
        className="my-6"
      />

      <div className="flex items-center justify-between">
        <div className="relative rounded-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <Input
            type="number"
            value={priceRange[0]}
            onChange={handleMinInputChange}
            min={minPrice}
            max={priceRange[1]}
            className="pl-7 pr-2 w-24"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="relative rounded-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={handleMaxInputChange}
            min={priceRange[0]}
            max={maxPrice}
            className="pl-7 pr-2 w-24"
          />
        </div>
      </div>
    </div>
  )
}
